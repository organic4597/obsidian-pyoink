export type DriftLevel = "none" | "soft" | "hard" | "broken";

export interface LayoutSnap {
  cssWidth: number;
  contentHeight: number;
  dpr: number;
  sourceMtime: number;
  sourceSize: number;
  snapshotAt: number;
}

export function measureLayout(
  contentEl: HTMLElement,
  sourceMtime: number,
  sourceSize: number,
  maxCssHeight: number,
): LayoutSnap {
  const cssWidth = Math.max(contentEl.scrollWidth, contentEl.clientWidth, 1);
  let contentHeight = Math.max(contentEl.scrollHeight, contentEl.clientHeight, 1);
  if (contentHeight > maxCssHeight) contentHeight = maxCssHeight;
  return {
    cssWidth,
    contentHeight,
    dpr: window.devicePixelRatio || 1,
    sourceMtime,
    sourceSize,
    snapshotAt: Date.now(),
  };
}

export function detectDrift(saved: LayoutSnap | null | undefined, live: LayoutSnap, sourceExists: boolean): DriftLevel {
  if (!sourceExists) return "broken";
  if (!saved || (!saved.sourceMtime && !saved.cssWidth)) return "none";
  if (saved.sourceMtime && live.sourceMtime && saved.sourceMtime !== live.sourceMtime) return "hard";
  if (saved.sourceSize && live.sourceSize && saved.sourceSize !== live.sourceSize) return "hard";
  if (saved.cssWidth > 0 && live.cssWidth > 0) {
    const wr = Math.abs(saved.cssWidth - live.cssWidth) / saved.cssWidth;
    const hr =
      saved.contentHeight > 0
        ? Math.abs(saved.contentHeight - live.contentHeight) / saved.contentHeight
        : 0;
    if (hr >= 0.2 || wr >= 0.15) return "hard";
    if (hr >= 0.05 || wr >= 0.02) return "soft";
  }
  return "none";
}

export function driftLabel(level: DriftLevel): string {
  switch (level) {
    case "soft":
      return "layout shifted slightly";
    case "hard":
      return "note changed — ink may misalign";
    case "broken":
      return "source note missing";
    default:
      return "";
  }
}
