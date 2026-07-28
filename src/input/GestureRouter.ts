import type { InkTool, FingerAction, PyoInkSettings } from "../util/settings";
import { inkLog } from "../util/errors";

export type GestureAction =
  | { type: "ignore" }
  | { type: "scroll" }
  | { type: "navigate-click"; clientX: number; clientY: number }
  | { type: "draw-start"; pointerId: number }
  | { type: "erase-start"; pointerId: number }
  | { type: "draw-move"; pointerId: number; samples: Sample[] }
  | { type: "draw-end"; pointerId: number }
  | { type: "finger-action"; action: FingerAction }
  /** @deprecated use finger-action */
  | { type: "tool-cycle" };

export interface Sample {
  x: number;
  y: number;
  pressure: number;
  t: number;
  pointerType: string;
}

/**
 * - pen: ink
 * - touch: scroll / multi-finger / double-tap shortcuts (never ink when penOnly)
 */
export class GestureRouter {
  private activeDrawId: number | null = null;
  private activeDrawType: string | null = null;
  private pointers = new Map<number, PointerEvent>();
  private lastPenAt = 0;
  private penDownIds = new Set<number>();
  private tool: InkTool = "pen";
  navigateMode = false;

  private fingerIds = new Set<number>();
  private multiFingerAnchor: { x: number; y: number; t: number; count: number } | null = null;
  private multiFingerMaxMove = 0;
  private lastShortcutAt = 0;

  private lastSingleTapAt = 0;
  private lastSingleTapX = 0;
  private lastSingleTapY = 0;

  private downSample: Sample | null = null;
  private movedPx = 0;

  constructor(private settings: () => PyoInkSettings) {}

  setTool(t: InkTool) {
    this.tool = t;
  }

  getTool(): InkTool {
    return this.tool;
  }

  getActiveDrawId(): number | null {
    return this.activeDrawId;
  }

  isDrawing(): boolean {
    return this.activeDrawId !== null;
  }

  clearActiveDraw() {
    this.activeDrawId = null;
    this.activeDrawType = null;
  }

  private penOwnsSurface(s: PyoInkSettings): boolean {
    if (this.penDownIds.size > 0) return true;
    if (this.activeDrawType === "pen") return true;
    if (performance.now() - this.lastPenAt < (s.palmRejectMs ?? 600)) return true;
    return false;
  }

  private fingerMayDraw(s: PyoInkSettings): boolean {
    if (s.penOnlyInk !== false) return false;
    if (!s.allowFingerDraw) return false;
    if (this.penOwnsSurface(s)) return false;
    return true;
  }

  onDown(ev: PointerEvent, canvasRect: DOMRect): GestureAction {
    this.pointers.set(ev.pointerId, ev);
    const s = this.settings();
    const sample = this.sampleFromEvent(ev, canvasRect);
    this.downSample = sample;
    this.movedPx = 0;

    if (ev.pointerType === "pen") {
      this.penDownIds.add(ev.pointerId);
      this.lastPenAt = performance.now();
    }

    if (ev.pointerType === "touch") {
      if (this.penOwnsSurface(s)) {
        inkLog("E_PALM");
        return { type: "ignore" };
      }

      this.fingerIds.add(ev.pointerId);

      if (this.fingerIds.size >= 2) {
        if (this.activeDrawId !== null && this.activeDrawType === "touch") {
          const id = this.activeDrawId;
          this.clearActiveDraw();
          this.armMulti(sample, this.fingerIds.size);
          return { type: "draw-end", pointerId: id };
        }
        this.armMulti(sample, this.fingerIds.size);
        return { type: "ignore" };
      }

      if (!this.fingerMayDraw(s)) {
        return { type: "scroll" };
      }
    }

    if (this.navigateMode && ev.pointerType !== "pen") {
      return { type: "ignore" };
    }

    if (s.penOnlyInk !== false && ev.pointerType === "touch") {
      return { type: "scroll" };
    }

    if (this.activeDrawId !== null && ev.pointerId !== this.activeDrawId) {
      inkLog("E_PTR_SECONDARY");
      return { type: "ignore" };
    }

    if (ev.pointerType === "touch" && s.penOnlyInk !== false) {
      return { type: "scroll" };
    }

    this.activeDrawId = ev.pointerId;
    this.activeDrawType = ev.pointerType || "mouse";
    if (this.tool === "eraser") return { type: "erase-start", pointerId: ev.pointerId };
    return { type: "draw-start", pointerId: ev.pointerId };
  }

  onMove(ev: PointerEvent, canvasRect: DOMRect): GestureAction {
    this.pointers.set(ev.pointerId, ev);
    const s = this.settings();
    const sample = this.sampleFromEvent(ev, canvasRect);

    if (ev.pointerType === "pen") {
      this.lastPenAt = performance.now();
      this.penDownIds.add(ev.pointerId);
    }

    if (this.downSample) {
      const dx = sample.x - this.downSample.x;
      const dy = sample.y - this.downSample.y;
      this.movedPx = Math.max(this.movedPx, Math.hypot(dx, dy));
    }

    if (ev.pointerType === "touch" && this.penOwnsSurface(s)) {
      return { type: "ignore" };
    }

    if (this.fingerIds.size >= 2 && this.multiFingerAnchor) {
      // update peak finger count while held
      this.multiFingerAnchor.count = Math.max(this.multiFingerAnchor.count, this.fingerIds.size);
      const dx = sample.x - this.multiFingerAnchor.x;
      const dy = sample.y - this.multiFingerAnchor.y;
      this.multiFingerMaxMove = Math.max(this.multiFingerMaxMove, Math.hypot(dx, dy));
      return { type: "ignore" };
    }

    if (ev.pointerType === "touch" && s.penOnlyInk !== false) {
      return { type: "ignore" };
    }

    if (this.activeDrawId === null || ev.pointerId !== this.activeDrawId) {
      return { type: "ignore" };
    }

    if (this.activeDrawType === "touch" && s.penOnlyInk !== false) {
      const id = this.activeDrawId;
      this.clearActiveDraw();
      return { type: "draw-end", pointerId: id };
    }

    return {
      type: "draw-move",
      pointerId: ev.pointerId,
      samples: this.collectSamples(ev, canvasRect),
    };
  }

  onUp(ev: PointerEvent, canvasRect: DOMRect): GestureAction {
    this.pointers.delete(ev.pointerId);
    const s = this.settings();

    if (ev.pointerType === "pen") {
      this.penDownIds.delete(ev.pointerId);
      this.lastPenAt = performance.now();
    }

    if (ev.pointerType === "touch") {
      this.fingerIds.delete(ev.pointerId);

      // multi-finger shortcut when all fingers up
      if (this.fingerIds.size === 0 && this.multiFingerAnchor) {
        const dt = performance.now() - this.multiFingerAnchor.t;
        const move = this.multiFingerMaxMove;
        const count = this.multiFingerAnchor.count;
        this.multiFingerAnchor = null;
        this.multiFingerMaxMove = 0;

        if (
          !this.penOwnsSurface(s) &&
          dt < 380 &&
          move < 22 &&
          performance.now() - this.lastShortcutAt > 220
        ) {
          const action =
            count >= 3
              ? s.threeFingerTapAction
              : s.twoFingerTapAction || (s.enableTwoFingerToolCycle ? "cycle_tool" : "none");
          if (action && action !== "none") {
            this.lastShortcutAt = performance.now();
            return { type: "finger-action", action };
          }
        }
      }

      // single-finger double-tap (scroll finger, not drawing)
      if (
        this.fingerIds.size === 0 &&
        !this.multiFingerAnchor &&
        this.activeDrawId === null &&
        !this.penOwnsSurface(s) &&
        this.movedPx < 14
      ) {
        const now = performance.now();
        const sample = this.sampleFromEvent(ev, canvasRect);
        if (
          now - this.lastSingleTapAt < 320 &&
          Math.hypot(sample.x - this.lastSingleTapX, sample.y - this.lastSingleTapY) < 40
        ) {
          this.lastSingleTapAt = 0;
          const action = s.doubleTapAction;
          if (action && action !== "none" && now - this.lastShortcutAt > 220) {
            this.lastShortcutAt = now;
            return { type: "finger-action", action };
          }
        } else {
          this.lastSingleTapAt = now;
          this.lastSingleTapX = sample.x;
          this.lastSingleTapY = sample.y;
        }
      }
    }

    if (
      this.navigateMode &&
      this.activeDrawId === null &&
      ev.pointerType !== "pen" &&
      this.movedPx < 8
    ) {
      return { type: "navigate-click", clientX: ev.clientX, clientY: ev.clientY };
    }

    if (
      !this.navigateMode &&
      this.activeDrawId === ev.pointerId &&
      ev.pointerType === "mouse" &&
      this.movedPx < 6 &&
      this.tool !== "eraser"
    ) {
      return { type: "navigate-click", clientX: ev.clientX, clientY: ev.clientY };
    }

    if (this.activeDrawId === ev.pointerId) {
      this.clearActiveDraw();
      return { type: "draw-end", pointerId: ev.pointerId };
    }
    return { type: "ignore" };
  }

  onCancel(ev: PointerEvent): GestureAction {
    this.pointers.delete(ev.pointerId);
    this.fingerIds.delete(ev.pointerId);
    if (ev.pointerType === "pen") {
      this.penDownIds.delete(ev.pointerId);
      this.lastPenAt = performance.now();
    }
    if (this.activeDrawId === ev.pointerId) {
      inkLog("E_PTR_LOST");
      this.clearActiveDraw();
      return { type: "draw-end", pointerId: ev.pointerId };
    }
    return { type: "ignore" };
  }

  private armMulti(sample: Sample, count: number) {
    this.multiFingerAnchor = {
      x: sample.x,
      y: sample.y,
      t: performance.now(),
      count,
    };
    this.multiFingerMaxMove = 0;
  }

  sampleFromEvent(ev: PointerEvent, rect: DOMRect): Sample {
    return {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
      pressure: ev.pressure,
      t: ev.timeStamp || performance.now(),
      pointerType: ev.pointerType || "mouse",
    };
  }

  private collectSamples(ev: PointerEvent, rect: DOMRect): Sample[] {
    const list =
      typeof ev.getCoalescedEvents === "function" ? ev.getCoalescedEvents() : [ev];
    return list.map((e) => this.sampleFromEvent(e, rect));
  }
}
