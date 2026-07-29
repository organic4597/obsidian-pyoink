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
  /** Pencil tip double-tap — cancel active stroke + optional undo of first tap */
  | { type: "pen-double-tap"; action: FingerAction; pointerId: number }
  /** Pencil tip short single tap with non-ink action */
  | { type: "pen-single-tap"; action: FingerAction; pointerId: number }
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

  /** Pencil tip double-tap (two quick tip taps) */
  private lastPenTapAt = 0;
  private lastPenTapX = 0;
  private lastPenTapY = 0;
  private penDownAt = 0;

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

  /**
   * Clear in-flight pointer / palm state when switching tools or navigate mode.
   * Prevents "nav → pen but ink dead" after stale penDownIds / activeDraw.
   */
  resetTransient() {
    this.activeDrawId = null;
    this.activeDrawType = null;
    this.pointers.clear();
    this.penDownIds.clear();
    this.fingerIds.clear();
    this.multiFingerAnchor = null;
    this.multiFingerMaxMove = 0;
    this.downSample = null;
    this.movedPx = 0;
  }

  /**
   * Drop one pointer without side-effect shortcuts (scroll pan end, lost capture).
   * Fixes freeze where fingerIds never cleared after scroll-only gestures.
   */
  releasePointer(pointerId: number, pointerType?: string) {
    this.pointers.delete(pointerId);
    this.fingerIds.delete(pointerId);
    if (pointerType === "pen" || this.penDownIds.has(pointerId)) {
      this.penDownIds.delete(pointerId);
    }
    if (this.activeDrawId === pointerId) {
      this.clearActiveDraw();
    }
    if (this.fingerIds.size === 0) {
      this.multiFingerAnchor = null;
      this.multiFingerMaxMove = 0;
    }
  }

  /** Hover / barrel proximity: buttons===0 and no contact pressure. */
  isPenHover(ev: PointerEvent): boolean {
    if (ev.pointerType !== "pen" && ev.pointerType !== "mouse") return false;
    if (ev.buttons !== 0) return false;
    // Contact usually has pressure > 0; hover is 0 (or undefined)
    const p = typeof ev.pressure === "number" ? ev.pressure : 0;
    return p <= 0;
  }

  /** True while a pen tip is physically down (block palm). */
  private penTipDown(): boolean {
    return this.penDownIds.size > 0 || this.activeDrawType === "pen";
  }

  /** Palm guard for ink — includes short post-pen window. */
  private penOwnsSurface(s: PyoInkSettings): boolean {
    if (this.penTipDown()) return true;
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
    // Stale multi-finger set from interrupted scroll freezes pan — scrub ghosts
    if (this.fingerIds.size > 0 && !this.pointers.size) {
      this.fingerIds.clear();
      this.multiFingerAnchor = null;
      this.multiFingerMaxMove = 0;
    }

    this.pointers.set(ev.pointerId, ev);
    const s = this.settings();
    const sample = this.sampleFromEvent(ev, canvasRect);
    this.downSample = sample;
    this.movedPx = 0;

    if (ev.pointerType === "pen") {
      // Contact only (not hover). Hover must not mark tip-down.
      if (ev.buttons > 0 || (typeof ev.pressure === "number" && ev.pressure > 0)) {
        this.penDownIds.add(ev.pointerId);
      }
      this.lastPenAt = performance.now();
      this.penDownAt = performance.now();
    }

    if (ev.pointerType === "touch") {
      // Only block while pen tip is actually down — do NOT block one-finger
      // pan during post-pen palmReject window (that made swipe feel broken).
      if (this.penTipDown()) {
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
        // Scroll path: finger id tracked until releasePointer on pan end
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
      // CRITICAL: do not treat hover (buttons===0) as tip-down — freezes scroll + kills hover UX
      if (ev.buttons > 0 || (typeof ev.pressure === "number" && ev.pressure > 0.01)) {
        this.penDownIds.add(ev.pointerId);
      } else {
        this.penDownIds.delete(ev.pointerId);
      }
    }

    if (this.downSample) {
      const dx = sample.x - this.downSample.x;
      const dy = sample.y - this.downSample.y;
      this.movedPx = Math.max(this.movedPx, Math.hypot(dx, dy));
    }

    // Palm block only while tip is down; allow pan after pen lift.
    if (ev.pointerType === "touch" && this.penTipDown()) {
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

      // Pencil tip double / single tap (barrel OS double-tap is NOT in WebView)
      const sPen = s;
      const wasDrawing = this.activeDrawId === ev.pointerId;
      const holdMs = performance.now() - (this.penDownAt || performance.now());
      const sample = this.sampleFromEvent(ev, canvasRect);
      // Looser thresholds — Pencil micro-jitter often exceeded 16px / 320ms
      const shortTap = this.movedPx < 36 && holdMs < 480;
      if (shortTap && wasDrawing && performance.now() - this.lastShortcutAt > 120) {
        const now = performance.now();
        // Double-tap first
        if (
          sPen.enablePencilDoubleTap !== false &&
          now - this.lastPenTapAt < 560 &&
          Math.hypot(sample.x - this.lastPenTapX, sample.y - this.lastPenTapY) < 72
        ) {
          this.lastPenTapAt = 0;
          this.lastShortcutAt = now;
          this.clearActiveDraw();
          const action =
            sPen.pencilDoubleTapAction && sPen.pencilDoubleTapAction !== "none"
              ? sPen.pencilDoubleTapAction
              : "cycle_tool";
          return {
            type: "pen-double-tap",
            action,
            pointerId: ev.pointerId,
          };
        }
        // Record for possible second tap
        this.lastPenTapAt = now;
        this.lastPenTapX = sample.x;
        this.lastPenTapY = sample.y;

        // Single short tip tap → optional non-ink action
        const single = sPen.pencilSingleTapAction || "ink";
        if (single !== "ink") {
          this.lastShortcutAt = now;
          this.clearActiveDraw();
          if (single === "none") {
            // swallow short tap (no ink, no shortcut)
            return { type: "pen-single-tap", action: "none", pointerId: ev.pointerId };
          }
          return {
            type: "pen-single-tap",
            action: single as FingerAction,
            pointerId: ev.pointerId,
          };
        }
        // ink mode: fall through to draw-end (tiny mark). Double-tap undoes it.
      }
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
