import type { InkTool } from "../util/settings";
import type { PyoInkSettings } from "../util/settings";
import { inkLog } from "../util/errors";

export type GestureAction =
  | { type: "ignore" }
  | { type: "scroll" }
  | { type: "navigate-click"; clientX: number; clientY: number }
  | { type: "draw-start"; pointerId: number }
  | { type: "erase-start"; pointerId: number }
  | { type: "draw-move"; pointerId: number; samples: Sample[] }
  | { type: "draw-end"; pointerId: number }
  | { type: "tool-cycle" };

export interface Sample {
  x: number;
  y: number;
  pressure: number;
  t: number;
  pointerType: string;
}

/**
 * Transparent-overlay pointer rules (iPad-first):
 *
 * - **pen (Apple Pencil)**: only input that draws/erases when penOnlyInk=true
 * - **touch (hand/finger)**: NEVER ink while pen-only; scroll OR two-finger tool cycle
 * - **while pen is down**: touch is fully ignored (palm reject — no accidental ink/scroll jump)
 * - **mouse**: draws on desktop; not treated as hand
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
  private twoFingerAnchor: { x: number; y: number; t: number } | null = null;
  private twoFingerMaxMove = 0;
  private lastCycleAt = 0;

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

  /** True if Apple Pencil / stylus should own the surface. */
  private penOwnsSurface(s: PyoInkSettings): boolean {
    if (this.penDownIds.size > 0) return true;
    if (this.activeDrawType === "pen") return true;
    // After pen lift, keep palm blocked briefly
    if (performance.now() - this.lastPenAt < (s.palmRejectMs ?? 600)) return true;
    return false;
  }

  /** Finger must never ink when penOnlyInk (default). */
  private fingerMayDraw(s: PyoInkSettings): boolean {
    if (s.penOnlyInk !== false) return false; // default hard off
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

    // --- TOUCH / HAND ---
    if (ev.pointerType === "touch") {
      // Pen active or recent → palm: ignore completely (no ink, no scroll jump)
      if (this.penOwnsSurface(s)) {
        inkLog("E_PALM");
        return { type: "ignore" };
      }

      this.fingerIds.add(ev.pointerId);

      // Two-finger tool cycle (not ink)
      if (this.fingerIds.size >= 2) {
        if (this.activeDrawId !== null && this.activeDrawType === "touch") {
          // shouldn't happen under penOnlyInk; end if any
          const id = this.activeDrawId;
          this.clearActiveDraw();
          this.armTwoFinger(sample);
          return { type: "draw-end", pointerId: id };
        }
        this.armTwoFinger(sample);
        return { type: "ignore" };
      }

      // Single finger: scroll only (never ink when penOnlyInk)
      if (!this.fingerMayDraw(s)) {
        return { type: "scroll" };
      }
      // finger draw allowed (explicit settings) — fall through
    }

    // Navigate mode: only pen draws
    if (this.navigateMode && ev.pointerType !== "pen") {
      return { type: "ignore" };
    }

    // Block any non-pen draw when penOnlyInk (except mouse for desktop)
    if (s.penOnlyInk !== false && ev.pointerType === "touch") {
      return { type: "scroll" };
    }

    if (this.activeDrawId !== null && ev.pointerId !== this.activeDrawId) {
      inkLog("E_PTR_SECONDARY");
      return { type: "ignore" };
    }

    // Safety: never start draw with touch if penOnlyInk
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

    // Touch while pen owns surface → ignore
    if (ev.pointerType === "touch" && this.penOwnsSurface(s)) {
      return { type: "ignore" };
    }

    if (this.fingerIds.size >= 2 && this.twoFingerAnchor) {
      const dx = sample.x - this.twoFingerAnchor.x;
      const dy = sample.y - this.twoFingerAnchor.y;
      this.twoFingerMaxMove = Math.max(this.twoFingerMaxMove, Math.hypot(dx, dy));
      return { type: "ignore" };
    }

    // Never turn touch moves into ink under penOnlyInk
    if (ev.pointerType === "touch" && s.penOnlyInk !== false) {
      return { type: "ignore" };
    }

    if (this.activeDrawId === null || ev.pointerId !== this.activeDrawId) {
      return { type: "ignore" };
    }

    // If draw session was somehow touch under pen-only, kill it
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
      if (this.fingerIds.size === 0 && this.twoFingerAnchor) {
        const dt = performance.now() - this.twoFingerAnchor.t;
        const move = this.twoFingerMaxMove;
        this.twoFingerAnchor = null;
        this.twoFingerMaxMove = 0;
        // only cycle if pen does not own surface
        if (
          !this.penOwnsSurface(s) &&
          s.enableTwoFingerToolCycle &&
          dt < 320 &&
          move < 18 &&
          performance.now() - this.lastCycleAt > 200
        ) {
          this.lastCycleAt = performance.now();
          return { type: "tool-cycle" };
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

  private armTwoFinger(sample: Sample) {
    this.twoFingerAnchor = { x: sample.x, y: sample.y, t: performance.now() };
    this.twoFingerMaxMove = 0;
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
    // Drop coalesced samples that aren't pen when penOnlyInk and this is pen stroke
    const list =
      typeof ev.getCoalescedEvents === "function" ? ev.getCoalescedEvents() : [ev];
    return list.map((e) => this.sampleFromEvent(e, rect));
  }
}
