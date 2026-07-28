import { clamp } from "./errors";

export type InkTool = "pen" | "highlighter" | "eraser";

export const PEN_COLORS = [
  "#1a1a1a",
  "#e03131",
  "#1971c2",
  "#2f9e44",
  "#f08c00",
  "#9c36b5",
] as const;

export const HI_COLORS = [
  "#ffe566",
  "#ff922b",
  "#69db7c",
  "#74c0fc",
  "#f783ac",
] as const;

export interface PyoInkSettings {
  annotationsFolder: string;
  penColor: string;
  highlighterColor: string;
  penWidth: number;
  highlighterWidth: number;
  toolCycle: InkTool[];
  enableTwoFingerToolCycle: boolean;
  enablePencilDoubleTapProbe: boolean;
  penOnlyInk: boolean;
  allowFingerDraw: boolean;
  palmRejectMs: number;
  simulatePressureFallback: boolean;
  pressureGain: number;
  pfSmoothing: number;
  pfThinning: number;
  pfStreamline: number;
  /** Idle save delay. High = less hitch while writing. Flush always on exit. */
  debounceMs: number;
  maxCanvasCssHeight: number;
  undoLimit: number;
  /** Toolbar position as % of root (draggable) */
  toolbarXPct: number;
  toolbarYPct: number;
}

export const DEFAULT_SETTINGS: PyoInkSettings = {
  annotationsFolder: "PyoInk",
  penColor: "#1a1a1a",
  highlighterColor: "#ffe566",
  penWidth: 2.4,
  highlighterWidth: 16,
  toolCycle: ["pen", "highlighter", "eraser"],
  enableTwoFingerToolCycle: true,
  enablePencilDoubleTapProbe: false,
  penOnlyInk: true,
  allowFingerDraw: false,
  palmRejectMs: 700,
  simulatePressureFallback: true,
  pressureGain: 1.2,
  pfSmoothing: 0.5,
  pfThinning: 0.5,
  pfStreamline: 0.5,
  // Don't thrash disk while writing — 8s idle or exit
  debounceMs: 8000,
  maxCanvasCssHeight: 8192,
  undoLimit: 40,
  toolbarXPct: 50,
  toolbarYPct: 92,
};

export function sanitizeSettings(raw: Partial<PyoInkSettings> | null | undefined): PyoInkSettings {
  const s = Object.assign({}, DEFAULT_SETTINGS, raw ?? {});
  let folder = String(s.annotationsFolder || "PyoInk").trim().replace(/\\/g, "/");
  if (!folder || folder.includes("..") || folder.startsWith("/") || folder.includes(":")) {
    folder = DEFAULT_SETTINGS.annotationsFolder;
  }
  s.annotationsFolder = folder.replace(/\/+$/, "");
  s.penWidth = clamp(Number(s.penWidth), 0.5, 40);
  s.highlighterWidth = clamp(Number(s.highlighterWidth), 2, 80);
  s.pressureGain = clamp(Number(s.pressureGain), 0.3, 3);
  s.pfSmoothing = clamp(Number(s.pfSmoothing), 0, 0.95);
  s.pfThinning = clamp(Number(s.pfThinning), -0.99, 0.99);
  s.pfStreamline = clamp(Number(s.pfStreamline), 0, 0.99);
  s.debounceMs = clamp(Number(s.debounceMs), 1000, 60000);
  s.maxCanvasCssHeight = clamp(Number(s.maxCanvasCssHeight), 2048, 16384);
  s.undoLimit = clamp(Number(s.undoLimit), 10, 200);
  s.palmRejectMs = clamp(Number(s.palmRejectMs), 0, 3000);
  s.toolbarXPct = clamp(Number(s.toolbarXPct), 5, 95);
  s.toolbarYPct = clamp(Number(s.toolbarYPct), 5, 95);
  if (s.penOnlyInk === undefined) s.penOnlyInk = true;
  if (s.penOnlyInk) s.allowFingerDraw = false;
  if (!Array.isArray(s.toolCycle) || s.toolCycle.length === 0) {
    s.toolCycle = [...DEFAULT_SETTINGS.toolCycle];
  }
  return s;
}
