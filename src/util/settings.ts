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
  none: "None (no shortcut)",
  cycle_tool: "Cycle tool (pen → marker → eraser)",
  undo: "Undo",
  redo: "Redo",
  toggle_nav: "Toggle navigate mode",
  pen: "Switch to pen",
  highlighter: "Switch to highlighter",
  eraser: "Switch to eraser",
  exit: "Leave ink view (save)",
};

/** Pencil tip single-tap: ink (draw) or a shortcut action. */
export type PencilSingleTapAction = FingerAction | "ink";

export const PENCIL_SINGLE_TAP_LABELS: Record<PencilSingleTapAction, string> = {
  ink: "Draw / write (default)",
  none: "Ignore short tap (no mark)",
  cycle_tool: "Cycle tool",
  undo: "Undo",
  redo: "Redo",
  toggle_nav: "Toggle navigate mode",
  pen: "Switch to pen",
  highlighter: "Switch to highlighter",
  eraser: "Switch to eraser",
  exit: "Leave ink view (save)",
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
  /**
   * Apple Pencil **tip** double-tap (two quick tip taps) — works in Obsidian WebView.
   * Barrel/side double-tap is OS-native and usually NOT delivered to plugins.
   */
  enablePencilDoubleTap: boolean;
  /** Action for Pencil tip double-tap (default: cycle tools). */
  pencilDoubleTapAction: FingerAction;
  /**
   * Short single tip tap: `ink` = draw (default), or a shortcut (no stroke).
   * Only applies to short taps (little movement); drags always draw.
   */
  pencilSingleTapAction: PencilSingleTapAction;
  /** @deprecated use enablePencilDoubleTap */
  enablePencilDoubleTapProbe?: boolean;
  penOnlyInk: boolean;
  allowFingerDraw: boolean;
  /**
   * When true: pen channel = ink only; touch channel = pan/zoom/gestures only.
   * Forces penOnlyInk and disables finger drawing. Recommended for iPad + Pencil.
   */
  strictPenTouchSeparate: boolean;
  /** Two-finger pinch to zoom the note+ink page. */
  enablePinchZoom: boolean;
  /** Min/max page zoom (1 = 100%). */
  minZoom: number;
  maxZoom: number;
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
  /** Single-finger double-tap (finger, not Pencil) */
  doubleTapAction: FingerAction;
}

/** Shared 7-step width ladders (toolbar slider). */
export const WIDTH_STEPS: Record<InkTool, number[]> = {
  pen: [1.0, 1.6, 2.2, 3.0, 4.0, 5.5, 8.0],
  highlighter: [8, 12, 16, 20, 26, 34, 44],
  eraser: [12, 18, 24, 32, 42, 56, 72],
};

export function nearestWidthStep(tool: InkTool, cur: number): number {
  const steps = WIDTH_STEPS[tool];
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < steps.length; i++) {
    const d = Math.abs(steps[i] - cur);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function snapWidth(tool: InkTool, cur: number): number {
  const steps = WIDTH_STEPS[tool];
  return steps[nearestWidthStep(tool, cur)];
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
  enablePencilDoubleTap: false,
  pencilDoubleTapAction: "cycle_tool",
  pencilSingleTapAction: "ink",
  penOnlyInk: true,
  allowFingerDraw: false,
  strictPenTouchSeparate: true,
  enablePinchZoom: true,
  minZoom: 0.5,
  maxZoom: 3,
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
  s.penWidth = snapWidth("pen", clamp(Number(s.penWidth), 0.5, 40));
  s.highlighterWidth = snapWidth(
    "highlighter",
    clamp(Number(s.highlighterWidth), 2, 80),
  );
  s.eraserWidth = snapWidth("eraser", clamp(Number(s.eraserWidth), 8, 120));
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
  if (s.strictPenTouchSeparate === undefined) s.strictPenTouchSeparate = true;
  if (s.enablePinchZoom === undefined) s.enablePinchZoom = true;
  s.minZoom = clamp(Number(s.minZoom ?? 0.5), 0.25, 1);
  s.maxZoom = clamp(Number(s.maxZoom ?? 3), 1, 5);
  if (s.minZoom > s.maxZoom) {
    const t = s.minZoom;
    s.minZoom = s.maxZoom;
    s.maxZoom = t;
  }
  // Strict channels: pen inks, touch never inks
  if (s.strictPenTouchSeparate) {
    s.penOnlyInk = true;
    s.allowFingerDraw = false;
  }
  if (s.penOnlyInk) s.allowFingerDraw = false;
  if (!Array.isArray(s.toolCycle) || s.toolCycle.length === 0) {
    s.toolCycle = [...DEFAULT_SETTINGS.toolCycle];
  }
  s.twoFingerTapAction = asFingerAction(s.twoFingerTapAction, "cycle_tool");
  s.threeFingerTapAction = asFingerAction(s.threeFingerTapAction, "undo");
  s.doubleTapAction = asFingerAction(s.doubleTapAction, "toggle_nav");
  // legacy probe flag → enablePencilDoubleTap
  if (s.enablePencilDoubleTap === undefined && s.enablePencilDoubleTapProbe !== undefined) {
    s.enablePencilDoubleTap = !!s.enablePencilDoubleTapProbe;
  }
  // Prefer off: handwriting lifts were misread as tip double-taps
  if (s.enablePencilDoubleTap === undefined) s.enablePencilDoubleTap = false;
  // 0.3.2 reliability: tip double-tap still unsafe during real writing — keep OFF.
  // Power users can re-enable in Settings after update (value persists once they toggle).
  // Force-off when migrating from builds that defaulted true without user intent:
  if (raw && (raw as Partial<PyoInkSettings>).enablePencilDoubleTap === true) {
    // Keep true only if pencilDoubleTapAction was customized from default? Still risky.
    // Hard force off for 0.3.2.
    s.enablePencilDoubleTap = false;
  }
  s.pencilDoubleTapAction = asFingerAction(
    s.pencilDoubleTapAction,
    "cycle_tool",
  );
  // pencil single tap: ink | finger actions
  {
    const raw = String(s.pencilSingleTapAction || "ink");
    if (raw === "ink" || FINGER_ACTIONS.has(raw)) {
      s.pencilSingleTapAction = raw as PencilSingleTapAction;
    } else {
      s.pencilSingleTapAction = "ink";
    }
  }
  // legacy: enableTwoFingerToolCycle false → none
  if (s.enableTwoFingerToolCycle === false && s.twoFingerTapAction === "cycle_tool") {
    s.twoFingerTapAction = "none";
  }
  return s;
}
