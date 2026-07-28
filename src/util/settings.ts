import { clamp } from "./errors";

export type InkTool = "pen" | "highlighter" | "eraser";

/** Finger gesture shortcuts (not ink). */
export type FingerAction =
  | "none"
  | "cycle_tool"
  | "undo"
  | "redo"
  | "toggle_nav"
  | "pen"
  | "highlighter"
  | "eraser"
  | "exit";

export const FINGER_ACTION_LABELS: Record<FingerAction, string> = {
  none: "None",
  cycle_tool: "Cycle tool",
  undo: "Undo",
  redo: "Redo",
  toggle_nav: "Toggle navigate",
  pen: "Pen",
  highlighter: "Highlighter",
  eraser: "Eraser",
  exit: "Leave (save)",
};

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
  eraserWidth: number;
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
  /** Idle ms with no ink before auto-save (default 12s). Always save on leave. */
  debounceMs: number;
  maxCanvasCssHeight: number;
  /** Undo/redo history depth (queue, max 50). */
  undoLimit: number;
  toolbarXPct: number;
  toolbarYPct: number;
  /** Two-finger short tap */
  twoFingerTapAction: FingerAction;
  /** Three-finger short tap */
  threeFingerTapAction: FingerAction;
  /** Single-finger double-tap */
  doubleTapAction: FingerAction;
}

const FINGER_ACTIONS = new Set<string>(Object.keys(FINGER_ACTION_LABELS));

function asFingerAction(v: unknown, fallback: FingerAction): FingerAction {
  const s = String(v || "");
  return FINGER_ACTIONS.has(s) ? (s as FingerAction) : fallback;
}

export const DEFAULT_SETTINGS: PyoInkSettings = {
  annotationsFolder: "PyoInk",
  penColor: "#1a1a1a",
  highlighterColor: "#ffe566",
  penWidth: 2.4,
  highlighterWidth: 16,
  eraserWidth: 28,
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
  debounceMs: 12000,
  maxCanvasCssHeight: 8192,
  undoLimit: 50,
  toolbarXPct: 50,
  toolbarYPct: 92,
  twoFingerTapAction: "cycle_tool",
  threeFingerTapAction: "undo",
  doubleTapAction: "toggle_nav",
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
  s.eraserWidth = clamp(Number(s.eraserWidth), 8, 120);
  s.pressureGain = clamp(Number(s.pressureGain), 0.3, 3);
  s.pfSmoothing = clamp(Number(s.pfSmoothing), 0, 0.95);
  s.pfThinning = clamp(Number(s.pfThinning), -0.99, 0.99);
  s.pfStreamline = clamp(Number(s.pfStreamline), 0, 0.99);
  s.debounceMs = clamp(Number(s.debounceMs), 1000, 60000);
  s.maxCanvasCssHeight = clamp(Number(s.maxCanvasCssHeight), 2048, 16384);
  // Hard cap 50-depth queue
  s.undoLimit = clamp(Number(s.undoLimit), 1, 50);
  s.palmRejectMs = clamp(Number(s.palmRejectMs), 0, 3000);
  s.toolbarXPct = clamp(Number(s.toolbarXPct), 5, 95);
  s.toolbarYPct = clamp(Number(s.toolbarYPct), 5, 95);
  if (s.penOnlyInk === undefined) s.penOnlyInk = true;
  if (s.penOnlyInk) s.allowFingerDraw = false;
  if (!Array.isArray(s.toolCycle) || s.toolCycle.length === 0) {
    s.toolCycle = [...DEFAULT_SETTINGS.toolCycle];
  }
  s.twoFingerTapAction = asFingerAction(s.twoFingerTapAction, "cycle_tool");
  s.threeFingerTapAction = asFingerAction(s.threeFingerTapAction, "undo");
  s.doubleTapAction = asFingerAction(s.doubleTapAction, "toggle_nav");
  // legacy: enableTwoFingerToolCycle false → none
  if (s.enableTwoFingerToolCycle === false && s.twoFingerTapAction === "cycle_tool") {
    s.twoFingerTapAction = "none";
  }
  return s;
}
