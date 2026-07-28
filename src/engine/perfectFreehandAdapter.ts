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
  if (input.length === 1) {
    const path = new Path2D();
    const r = Math.max(0.5, style.size * (input[0][2] ?? 0.5) * 0.5);
    path.arc(input[0][0], input[0][1], r, 0, Math.PI * 2);
    return path;
  }

  const size = Math.max(0.5, style.size);
  try {
    const outline = getStroke(input, {
      size,
      thinning: style.tool === "highlighter" ? 0.05 : settings.pfThinning,
      smoothing: settings.pfSmoothing,
      streamline: settings.pfStreamline,
      simulatePressure: opts.simulatePressure,
      last: opts.last,
    });
    if (!outline || outline.length < 2) return null;
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
    const path = new Path2D();
    path.moveTo(input[0][0], input[0][1]);
    for (let i = 1; i < input.length; i++) path.lineTo(input[i][0], input[i][1]);
    return path;
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
