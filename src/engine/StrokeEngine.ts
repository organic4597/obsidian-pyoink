import type { InkStroke, PointTuple } from "../store/schema";
import type { PyoInkSettings, InkTool } from "../util/settings";
import { buildStrokePath, fillStrokePath } from "./perfectFreehandAdapter";
import { inkLog } from "../util/errors";

export class StrokeEngine {
  strokes: InkStroke[] = [];
  private undoStack: InkStroke[][] = [];
  private redoStack: InkStroke[][] = [];
  private active: InkStroke | null = null;
  private lastPressure = 0.5;
  private sawRealPressure = false;
  private erasing = false;
  private eraseDirty = false;
  /** Snapshot index at erase start — discard if nothing removed */
  private eraseUndoPushed = false;

  constructor(private settings: PyoInkSettings) {}

  setSettings(s: PyoInkSettings) {
    this.settings = s;
  }

  getActive(): InkStroke | null {
    return this.active;
  }

  isStroking(): boolean {
    return this.active !== null || this.erasing;
  }

  canUndo(): boolean {
    return !this.isStroking() && this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return !this.isStroking() && this.redoStack.length > 0;
  }

  private cloneStrokes(list: InkStroke[]): InkStroke[] {
    return list.map((s) => ({ ...s, points: s.points.map((p) => [...p] as PointTuple) }));
  }

  /**
   * Undo snapshots: committed strokes are immutable (points not mutated after end),
   * so a shallow array copy is enough. Deep-cloning every pen-down was the main
   * lift→re-down hitch with longer notes.
   */
  private snapshotStrokes(): InkStroke[] {
    return this.strokes.slice();
  }

  private pushUndo() {
    // FIFO queue: drop oldest when over undoLimit (cap 50 in settings)
    this.undoStack.push(this.snapshotStrokes());
    const limit = Math.min(50, Math.max(1, this.settings.undoLimit || 50));
    while (this.undoStack.length > limit) this.undoStack.shift();
    // new branch kills redo (also queue-capped)
    this.redoStack = [];
  }

  beginPen(tool: Exclude<InkTool, "eraser">, color: string, size: number, pt: PointTuple) {
    // Never orphan an in-flight stroke / erase session
    if (this.active || this.erasing) {
      this.end();
    }
    this.pushUndo();
    this.sawRealPressure = false;
    this.lastPressure = pt[2];
    this.active = {
      id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      tool,
      color,
      size,
      points: [pt],
      ended: false,
    };
  }

  beginErase() {
    if (this.active) {
      this.end();
    }
    if (!this.erasing) {
      this.pushUndo();
      this.erasing = true;
      this.eraseDirty = false;
      this.eraseUndoPushed = true;
    }
  }

  private normalizePressure(raw: number, pointerType: string): number {
    if (!Number.isFinite(raw) || raw <= 0) {
      inkLog("E_PRESSURE_ZERO");
      return this.lastPressure > 0 ? this.lastPressure : 0.5;
    }
    const p = Math.min(1, Math.max(0.05, raw * this.settings.pressureGain));
    if (pointerType === "pen" && raw > 0 && raw < 1) this.sawRealPressure = true;
    this.lastPressure = p;
    return p;
  }

  extend(points: { x: number; y: number; pressure: number; t: number; pointerType: string }[]) {
    if (!this.active) return;
    for (const ep of points) {
      if (!Number.isFinite(ep.x) || !Number.isFinite(ep.y)) continue;
      const p = this.normalizePressure(ep.pressure, ep.pointerType);
      this.active.points.push([ep.x, ep.y, p, ep.t]);
      if (this.active.points.length > 50_000) break;
    }
  }

  end(): boolean {
    if (this.erasing) {
      const changed = this.eraseDirty;
      this.erasing = false;
      this.eraseDirty = false;
      if (!changed && this.eraseUndoPushed) {
        // discard empty erase snapshot — do NOT assign strokes from stack
        this.undoStack.pop();
      }
      this.eraseUndoPushed = false;
      return changed;
    }
    if (!this.active) return false;
    this.active.ended = true;
    if (this.active.points.length >= 1) this.strokes.push(this.active);
    const finished = this.active;
    this.active = null;
    this._lastFinished = finished;
    return true;
  }

  /** Last stroke committed by end() — for incremental cache stamp. */
  private _lastFinished: InkStroke | null = null;

  takeLastFinished(): InkStroke | null {
    const s = this._lastFinished;
    this._lastFinished = null;
    return s;
  }

  cancel() {
    this._lastFinished = null;
    if (this.erasing) {
      if (this.eraseUndoPushed && this.undoStack.length) {
        this.strokes = this.undoStack.pop()!;
      }
      this.erasing = false;
      this.eraseDirty = false;
      this.eraseUndoPushed = false;
    }
    if (this.active) {
      // drop unfinished stroke; undo already has pre-stroke state
      if (this.undoStack.length) this.strokes = this.undoStack.pop()!;
      this.active = null;
    }
  }

  eraseAt(x: number, y: number, radius: number) {
    if (!this.erasing) this.beginErase();
    const r2 = radius * radius;
    const keep: InkStroke[] = [];
    let removed = false;
    for (const s of this.strokes) {
      const hit = s.points.some((pt) => {
        const dx = pt[0] - x;
        const dy = pt[1] - y;
        return dx * dx + dy * dy <= r2;
      });
      if (hit) removed = true;
      else keep.push(s);
    }
    if (removed) {
      this.strokes = keep;
      this.eraseDirty = true;
    }
  }

  undo(): boolean {
    if (this.isStroking()) return false;
    if (!this.undoStack.length) return false;
    this.redoStack.push(this.snapshotStrokes());
    const limit = Math.min(50, Math.max(1, this.settings.undoLimit || 50));
    while (this.redoStack.length > limit) this.redoStack.shift();
    // Restore a slice so later mutations never touch the stack entry
    this.strokes = this.undoStack.pop()!.slice();
    return true;
  }

  redo(): boolean {
    if (this.isStroking()) return false;
    if (!this.redoStack.length) return false;
    this.undoStack.push(this.snapshotStrokes());
    const limit = Math.min(50, Math.max(1, this.settings.undoLimit || 50));
    while (this.undoStack.length > limit) this.undoStack.shift();
    this.strokes = this.redoStack.pop()!.slice();
    return true;
  }

  loadStrokes(strokes: InkStroke[]) {
    this.strokes = this.cloneStrokes(strokes);
    this.active = null;
    this.erasing = false;
    this.eraseDirty = false;
    this.eraseUndoPushed = false;
    this.undoStack = [];
    this.redoStack = [];
  }

  exportStrokes(): InkStroke[] {
    return this.cloneStrokes(this.strokes).map((s) => ({ ...s, ended: true }));
  }

  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cache: HTMLCanvasElement | null,
    cacheValid: boolean,
  ): void {
    ctx.clearRect(0, 0, w, h);
    if (cache && cacheValid) {
      ctx.drawImage(cache, 0, 0, w, h);
    } else {
      for (const s of this.strokes) this.paintStroke(ctx, s, true);
    }
    if (this.active) this.paintStroke(ctx, this.active, false);
  }

  rebuildCache(cache: HTMLCanvasElement, w: number, h: number, dpr: number) {
    cache.width = Math.max(1, Math.floor(w * dpr));
    cache.height = Math.max(1, Math.floor(h * dpr));
    const c = cache.getContext("2d");
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    for (const s of this.strokes) this.paintStroke(c, s, true);
  }

  /** Append one finished stroke onto existing cache (fast path between pen lifts). */
  stampStrokeToCache(
    cache: HTMLCanvasElement,
    stroke: InkStroke,
    w: number,
    h: number,
    dpr: number,
  ) {
    if (cache.width < 1 || cache.height < 1) {
      this.rebuildCache(cache, w, h, dpr);
      return;
    }
    const c = cache.getContext("2d");
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.paintStroke(c, stroke, true);
  }

  private paintStroke(ctx: CanvasRenderingContext2D, s: InkStroke, last: boolean) {
    const simulate =
      this.settings.simulatePressureFallback &&
      (s === this.active ? !this.sawRealPressure : pressureMostlyFlat(s.points));
    const path = buildStrokePath(
      s.points,
      { tool: s.tool, color: s.color, size: s.size },
      this.settings,
      { last, simulatePressure: simulate },
    );
    if (!path) return;
    fillStrokePath(ctx, path, { tool: s.tool, color: s.color, size: s.size }, false);
  }
}

function pressureMostlyFlat(points: PointTuple[]): boolean {
  if (points.length < 3) return true;
  let min = 1;
  let max = 0;
  for (const p of points) {
    min = Math.min(min, p[2]);
    max = Math.max(max, p[2]);
  }
  return max - min < 0.05;
}
