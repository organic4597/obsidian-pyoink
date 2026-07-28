import { clamp } from "./errors";

export type InkTool = "pen" | "highlighter" | "eraser";

export interface PyoInkSettings {
  annotationsFolder: string;
  penColor: string;
  highlighterColor: string;
  penWidth: number;
  highlighterWidth: number;
  toolCycle: InkTool[];
  enableTwoFingerToolCycle: boolean;
  /** Default false — false positives on short dots */
  enablePencilDoubleTapProbe: boolean;
  /**
   * When true (default): only Apple Pencil / stylus (`pointerType=pen`) inks.
   * Finger/hand never draws — scroll or two-finger cycle only.
   * While pen is down, palm touches are fully ignored.
   */
  penOnlyInk: boolean;
  /** Only used if penOnlyInk is false. Still blocked while pen recently active. */
  allowFingerDraw: boolean;
  /** ms after pen lift to keep ignoring palm/hand as ink */
  palmRejectMs: number;
  simulatePressureFallback: boolean;
  pressureGain: number;
  /** perfect-freehand smoothing 0..1 */
  pfSmoothing: number;
  pfThinning: number;
  pfStreamline: number;
  debounceMs: number;
  maxCanvasCssHeight: number;
  undoLimit: number;
}

export const DEFAULT_SETTINGS: PyoInkSettings = {
  annotationsFolder: "PyoInk",
  penColor: "#1a1a1a",
  highlighterColor: "#ffe566",
  penWidth: 2.2,
  highlighterWidth: 14,
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
  debounceMs: 400,
  maxCanvasCssHeight: 8192,
  undoLimit: 80,
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
  s.debounceMs = clamp(Number(s.debounceMs), 100, 2000);
  s.maxCanvasCssHeight = clamp(Number(s.maxCanvasCssHeight), 2048, 16384);
  s.undoLimit = clamp(Number(s.undoLimit), 10, 200);
  s.palmRejectMs = clamp(Number(s.palmRejectMs), 0, 3000);
  if (s.penOnlyInk === undefined) s.penOnlyInk = true;
  // pen-only implies no finger ink
  if (s.penOnlyInk) s.allowFingerDraw = false;
  if (!Array.isArray(s.toolCycle) || s.toolCycle.length === 0) {
    s.toolCycle = [...DEFAULT_SETTINGS.toolCycle];
  }
  return s;
}
