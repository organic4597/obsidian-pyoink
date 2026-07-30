import type { InkTool } from "../util/settings";
import { inkLog } from "../util/errors";

export const PYOINK_MAGIC = "pyoink";
export const PYOINK_VERSION = 1;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_POINTS_PER_STROKE = 50_000;
export const MAX_STROKES = 5_000;

/** [x, y, pressure 0..1, t ms] */
export type PointTuple = [number, number, number, number];

export interface InkStroke {
  id: string;
  tool: InkTool;
  color: string;
  size: number;
  points: PointTuple[];
  ended: boolean;
}

export interface InkDocV1 {
  v: 1;
  magic: typeof PYOINK_MAGIC;
  source: string;
  sourcePathNorm: string;
  sourceMtime: number;
  sourceSize: number;
  layout: {
    cssWidth: number;
    contentHeight: number;
    dpr: number;
    snapshotAt: number;
  };
  settingsEcho?: Record<string, unknown>;
  strokes: InkStroke[];
  meta: {
    createdAt: number;
    updatedAt: number;
    appId: string;
    appVersion: string;
  };
}

export type LoadResult =
  | { ok: true; doc: InkDocV1; warnings: string[] }
  | { ok: false; code: string; doc: InkDocV1; warnings: string[] };

function emptyDoc(source: string): InkDocV1 {
  const now = Date.now();
  return {
    v: 1,
    magic: PYOINK_MAGIC,
    source,
    sourcePathNorm: source,
    sourceMtime: 0,
    sourceSize: 0,
    layout: { cssWidth: 0, contentHeight: 0, dpr: 1, snapshotAt: now },
    strokes: [],
    meta: {
      createdAt: now,
      updatedAt: now,
      appId: "pyoink",
      appVersion: "0.5.0",
    },
  };
}

function isFiniteNum(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function sanitizePoint(p: unknown): PointTuple | null {
  if (!Array.isArray(p) || p.length < 2) return null;
  const x = Number(p[0]);
  const y = Number(p[1]);
  if (!isFiniteNum(x) || !isFiniteNum(y)) return null;
  let pr = p.length > 2 ? Number(p[2]) : 0.5;
  if (!isFiniteNum(pr)) pr = 0.5;
  pr = Math.min(1, Math.max(0.05, pr));
  let t = p.length > 3 ? Number(p[3]) : 0;
  if (!isFiniteNum(t)) t = 0;
  return [x, y, pr, t];
}

function sanitizeStroke(raw: unknown, warnings: string[]): InkStroke | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const tool = o.tool;
  if (tool !== "pen" && tool !== "highlighter" && tool !== "eraser") {
    warnings.push("E_TOOL");
    return null;
  }
  if (tool === "eraser") return null; // eraser is tool mode, not stored stroke
  const ptsIn = o.points;
  if (!Array.isArray(ptsIn)) {
    warnings.push("E_STROKE");
    return null;
  }
  if (ptsIn.length > MAX_POINTS_PER_STROKE) {
    warnings.push("E_LIMIT");
  }
  const points: PointTuple[] = [];
  const limit = Math.min(ptsIn.length, MAX_POINTS_PER_STROKE);
  for (let i = 0; i < limit; i++) {
    const pt = sanitizePoint(ptsIn[i]);
    if (pt) points.push(pt);
  }
  if (points.length === 0) {
    warnings.push("E_STROKE");
    return null;
  }
  const id = typeof o.id === "string" && o.id ? o.id : `s_rec_${Math.random().toString(36).slice(2, 9)}`;
  const color = typeof o.color === "string" ? o.color : "#1a1a1a";
  const size = isFiniteNum(Number(o.size)) ? Math.max(0.5, Number(o.size)) : 2.2;
  return { id, tool, color, size, points, ended: true };
}

export function parseInkJson(text: string, expectedSource: string): LoadResult {
  const warnings: string[] = [];
  if (text.length > MAX_FILE_BYTES) {
    inkLog("E_LIMIT", { len: text.length });
    return { ok: false, code: "E_LIMIT", doc: emptyDoc(expectedSource), warnings: ["E_LIMIT"] };
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    inkLog("E_JSON", e);
    return { ok: false, code: "E_JSON", doc: emptyDoc(expectedSource), warnings: ["E_JSON"] };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, code: "E_JSON", doc: emptyDoc(expectedSource), warnings: ["E_JSON"] };
  }
  const o = data as Record<string, unknown>;
  const magicOk =
    o.magic === PYOINK_MAGIC ||
    o.magic === "hermes-ink" || // legacy rename
    o.magic === "pyoink";
  if (!magicOk) {
    // allow scaffold without magic if v===1 and strokes array
    if (!(o.v === 1 && Array.isArray(o.strokes))) {
      inkLog("E_MAGIC", o.magic);
      return { ok: false, code: "E_MAGIC", doc: emptyDoc(expectedSource), warnings: ["E_MAGIC"] };
    }
    warnings.push("E_MAGIC_LEGACY");
  } else if (o.magic === "hermes-ink") {
    warnings.push("E_MAGIC_LEGACY");
  }
  if (typeof o.v === "number" && o.v > PYOINK_VERSION) {
    inkLog("E_VER", o.v);
    return { ok: false, code: "E_VER", doc: emptyDoc(expectedSource), warnings: ["E_VER"] };
  }

  const doc = emptyDoc(expectedSource);
  doc.source = typeof o.source === "string" ? o.source : expectedSource;
  doc.sourcePathNorm = typeof o.sourcePathNorm === "string" ? o.sourcePathNorm : doc.source;
  doc.sourceMtime = isFiniteNum(Number(o.sourceMtime)) ? Number(o.sourceMtime) : 0;
  doc.sourceSize = isFiniteNum(Number(o.sourceSize)) ? Number(o.sourceSize) : 0;
  if (o.layout && typeof o.layout === "object") {
    const L = o.layout as Record<string, unknown>;
    doc.layout.cssWidth = Number(L.cssWidth) || 0;
    doc.layout.contentHeight = Number(L.contentHeight) || 0;
    doc.layout.dpr = Number(L.dpr) || 1;
    doc.layout.snapshotAt = Number(L.snapshotAt) || Date.now();
  }
  if (o.meta && typeof o.meta === "object") {
    const M = o.meta as Record<string, unknown>;
    doc.meta.createdAt = Number(M.createdAt) || doc.meta.createdAt;
    doc.meta.updatedAt = Number(M.updatedAt) || doc.meta.updatedAt;
  }
  const strokesIn = Array.isArray(o.strokes) ? o.strokes : [];
  if (strokesIn.length > MAX_STROKES) warnings.push("E_LIMIT");
  const strokes: InkStroke[] = [];
  for (let i = 0; i < Math.min(strokesIn.length, MAX_STROKES); i++) {
    const s = sanitizeStroke(strokesIn[i], warnings);
    if (s) strokes.push(s);
  }
  doc.strokes = strokes;
  if (doc.source !== expectedSource) {
    warnings.push("E_SOURCE_MISMATCH");
  }
  return { ok: true, doc, warnings };
}

export function serializeInkDoc(doc: InkDocV1): string {
  doc.meta.updatedAt = Date.now();
  return JSON.stringify(doc, null, 2);
}

/** Design §4.3 */
export function encodeSourcePath(sourcePath: string): string {
  let p = sourcePath.normalize("NFC").replace(/\\/g, "/");
  p = p.replace(/[<>:"|?*\x00-\x1f]/g, "_");
  p = p.replace(/\//g, "__");
  if (p.length <= 180) return p;
  // FNV-1a 32-bit hex suffix
  let h = 0x811c9dc5;
  for (let i = 0; i < sourcePath.length; i++) {
    h ^= sourcePath.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `${p.slice(0, 160)}__${hex}`;
}

export function annotationRelPath(folder: string, sourcePath: string): string {
  const f = folder.replace(/\/+$/, "");
  return `${f}/${encodeSourcePath(sourcePath)}.pyoink.json`;
}

export { emptyDoc };
