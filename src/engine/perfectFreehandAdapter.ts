import { getStroke } from "perfect-freehand";
import type { PointTuple } from "../store/schema";
import { inkLog } from "../util/errors";
import type { PyoInkSettings } from "../util/settings";
import type { InkTool } from "../util/settings";

export interface StrokeStyle {
  tool: InkTool;
  color: string;
  size: number;
}

function toPfInput(points: PointTuple[]): number[][] {
  const out: number[][] = [];
  for (const p of points) {
    const x = p[0];
    const y = p[1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    let pr = p[2];
    if (!Number.isFinite(pr)) pr = 0.5;
    pr = Math.min(1, Math.max(0.05, pr));
    out.push([x, y, pr]);
  }
  return out;
}

function pathLen(input: number[][]): number {
  let L = 0;
  for (let i = 1; i < input.length; i++) {
    const dx = input[i][0] - input[i - 1][0];
    const dy = input[i][1] - input[i - 1][1];
    L += Math.hypot(dx, dy);
  }
  return L;
}

/**
 * Reliable short-stroke rendering for Hangul jamo (ㅣ, ㅡ, dots).
 * perfect-freehand + high streamline often returns an empty outline for 2–6
 * point flicks, so those strokes vanish while longer ones (ㅇ) still show.
 */
function capsulePath(input: number[][], size: number): Path2D {
  const path = new Path2D();
  const r = Math.max(0.6, size * 0.48);
  if (input.length === 1) {
    path.arc(input[0][0], input[0][1], r, 0, Math.PI * 2);
    return path;
  }
  // Rounded polyline via thick stroke simulation (filled stadiums between segments)
  for (let i = 0; i < input.length; i++) {
    path.moveTo(input[i][0] + r, input[i][1]);
    path.arc(input[i][0], input[i][1], r, 0, Math.PI * 2);
  }
  for (let i = 1; i < input.length; i++) {
    const x0 = input[i - 1][0];
    const y0 = input[i - 1][1];
    const x1 = input[i][0];
    const y1 = input[i][1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * r;
    const ny = (dx / len) * r;
    path.moveTo(x0 + nx, y0 + ny);
    path.lineTo(x1 + nx, y1 + ny);
    path.lineTo(x1 - nx, y1 - ny);
    path.lineTo(x0 - nx, y0 - ny);
    path.closePath();
  }
  return path;
}

export function buildStrokePath(
  points: PointTuple[],
  style: StrokeStyle,
  settings: PyoInkSettings,
  opts: { last: boolean; simulatePressure: boolean },
): Path2D | null {
  const input = toPfInput(points);
  if (input.length === 0) {
    inkLog("E_PF_EMPTY");
    return null;
  }

  const size = Math.max(0.5, style.size);
  const len = pathLen(input);

  // Hangul multi-stroke (ㅁ = 3–4 sides): each side is short. Prefer capsule
  // whenever the stroke is not long enough for PF to be stable.
  if (input.length <= 14 || len < size * 8) {
    return capsulePath(input, size);
  }

  try {
    // Live ink: keep streamline low so sides of ㅁ stay visible mid-stroke
    const streamline = opts.last
      ? Math.min(settings.pfStreamline, 0.5)
      : Math.min(settings.pfStreamline, 0.35);
    const outline = getStroke(input, {
      size,
      thinning: style.tool === "highlighter" ? 0.05 : settings.pfThinning,
      smoothing: Math.min(settings.pfSmoothing, opts.last ? 0.55 : 0.4),
      streamline,
      simulatePressure: opts.simulatePressure,
      last: opts.last,
    });
    if (!outline || outline.length < 2) {
      // PF failed (common on short/jagged input) — never drop the stroke
      return capsulePath(input, size);
    }
    const stride = outline.length > 20000 ? Math.ceil(outline.length / 10000) : 1;
    const path = new Path2D();
    path.moveTo(outline[0][0], outline[0][1]);
    for (let i = stride; i < outline.length; i += stride) {
      const pt = outline[i];
      if (!pt || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) continue;
      path.lineTo(pt[0], pt[1]);
    }
    path.closePath();
    return path;
  } catch (e) {
    inkLog("E_PF_THROW", e);
    return capsulePath(input, size);
  }
}

export function fillStrokePath(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  style: StrokeStyle,
  fallbackPolyline: boolean,
): void {
  ctx.save();
  if (style.tool === "highlighter") {
    // source-over + alpha works on light/dark; multiply fails on dark bg
    ctx.globalAlpha = 0.4;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = style.color;
    if (fallbackPolyline) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
    } else {
      ctx.fill(path);
    }
  } else {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = style.color;
    if (fallbackPolyline) {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
    } else {
      ctx.fill(path);
    }
  }
  ctx.restore();
}
