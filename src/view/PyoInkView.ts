import {
  ItemView,
  MarkdownRenderer,
  Notice,
  TFile,
  WorkspaceLeaf,
} from "obsidian";
import type PyoInkPlugin from "../../main";
import { StrokeEngine } from "../engine/StrokeEngine";
import { GestureRouter } from "../input/GestureRouter";
import { measureLayout } from "../layout/LayoutSnapshot";
import { emptyDoc, type InkDocV1 } from "../store/schema";
import { InkStore } from "../store/InkStore";
import type { InkTool } from "../util/settings";
import {
  HI_COLORS,
  PEN_COLORS,
  WIDTH_STEPS,
  nearestWidthStep,
  type FingerAction,
} from "../util/settings";
import { inkLog } from "../util/errors";

/** Built-in SVGs — setIcon lucide names often invisible/missing in some themes. */
const TOOLBAR_SVG: Record<string, string> = {
  pen: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  highlighter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`,
  eraser: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`,
  nav: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 3L3 13"/></svg>`,
  redo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3L21 13"/></svg>`,
  exit: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
};

export const VIEW_TYPE_PYOINK = "pyoink-view";

type ViewState = "idle" | "loading" | "ready" | "error" | "stroking" | "saving";

/**
 * Transparent ink layer over rendered Markdown:
 *
 *   scroll
 *     page (relative)
 *       content  ← MD (visible)
 *       canvas   ← transparent ink overlay (absolute, same size)
 *   toolbar / badges
 */
export class PyoInkView extends ItemView {
  file: TFile | null = null;
  private state: ViewState = "idle";
  private engine: StrokeEngine;
  private gestures: GestureRouter;
  private store: InkStore;
  private doc: InkDocV1 = emptyDoc("");
  private dirty = false;
  private remoteNewer = false;

  private rootEl!: HTMLElement;
  private scrollEl!: HTMLElement;
  private zoomPadEl!: HTMLElement;
  private pageEl!: HTMLElement;
  private noteEl!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private cacheCanvas: HTMLCanvasElement | null = null;
  private cacheValid = false;
  private toolbarEl!: HTMLElement;
  /** Excalidraw-style left properties rail (color / size). */
  private propsEl!: HTMLElement;
  private propsBodyEl!: HTMLElement;
  private colorRowEl!: HTMLElement;
  private rgbRowEl!: HTMLElement;
  private widthRowEl!: HTMLElement;
  private navBtn: HTMLButtonElement | null = null;
  private propsToggleBtn: HTMLButtonElement | null = null;
  private propsCollapsed = false;
  private saveBadgeEl: HTMLElement | null = null;
  private zoomBadgeEl: HTMLElement | null = null;
  private dragBound = false;
  private cursorX = -1;
  private cursorY = -1;
  private cursorOn = false;
  /** Apple Pencil / pen hover pressure (0 when unknown). */
  private cursorPressure = 0.5;
  private undoBtn: HTMLButtonElement | null = null;
  private redoBtn: HTMLButtonElement | null = null;
  /** Content zoom (1 = 100%). Touch pinch / ctrl-wheel. */
  private viewZoom = 1;

  private saveTimer: number | null = null;
  private raf = 0;
  private needRedraw = false;
  private unsubModify: (() => void) | null = null;
  private resizeObs: ResizeObserver | null = null;
  private cssW = 0;
  private cssH = 0;
  private scrollTouchId: number | null = null;
  private lastScrollY = 0;
  private lastScrollX = 0;
  /** Finger pan velocity (px/ms) for fling inertia */
  private scrollVelX = 0;
  private scrollVelY = 0;
  private scrollLastT = 0;
  private flingRaf = 0;
  private panRaf = 0;
  private panPendingX = 0;
  private panPendingY = 0;

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: PyoInkPlugin,
  ) {
    super(leaf);
    this.engine = new StrokeEngine(plugin.settings);
    this.gestures = new GestureRouter(() => this.plugin.settings);
    this.store = new InkStore(this.app, () => this.plugin.settings);
  }

  getViewType() {
    return VIEW_TYPE_PYOINK;
  }

  getDisplayText() {
    return this.file ? `PyoInk: ${this.file.basename}` : "PyoInk";
  }

  getIcon() {
    return "pen-tool";
  }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    this.rootEl = container.createDiv({ cls: "pyoink-root" });
    this.scrollEl = this.rootEl.createDiv({ cls: "pyoink-scroll" });
    // zoomPad absorbs layout size = content * zoom so scroll range matches visual scale
    this.zoomPadEl = this.scrollEl.createDiv({ cls: "pyoink-zoom-pad" });
    // page = content + transparent canvas stacked
    this.pageEl = this.zoomPadEl.createDiv({ cls: "pyoink-page" });
    this.noteEl = this.pageEl.createDiv({ cls: "pyoink-content" });
    this.canvas = this.pageEl.createEl("canvas", { cls: "pyoink-canvas" });
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2d unavailable");
    this.ctx = ctx;
    this.cacheCanvas = document.createElement("canvas");
    this.viewZoom = 1;
    this.buildToolbar();
    this.bindPointer();
    this.bindKeys();
  }

  async onClose() {
    await this.flushSave();
    this.teardownWatchers();
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  async openFile(file: TFile) {
    if (file.extension !== "md") {
      inkLog("E_NO_MD");
      new Notice("PyoInk: Markdown only");
      return;
    }
    await this.flushSave();
    this.teardownWatchers();
    this.state = "loading";
    this.file = file;
    this.dirty = false;
    this.remoteNewer = false;
    this.engine = new StrokeEngine(this.plugin.settings);
    this.gestures = new GestureRouter(() => this.plugin.settings);
    this.gestures.navigateMode = false;
    this.viewZoom = 1;
    this.gestures.setViewZoom(1);
    this.applyPageZoom();
    this.syncToolbar();
    this.noteEl.empty();

    // Reading-view style render so theme + MD layout match normal Obsidian.
    try {
      const md = await this.app.vault.read(file);
      await this.renderReadingView(md, file);
    } catch (e) {
      inkLog("E_RENDER", e);
      this.state = "error";
      this.noteEl.setText("(render failed)");
      new Notice("PyoInk: markdown render failed");
    }

    const loaded = await this.store.load(file.path);
    this.doc = loaded.doc;
    this.doc.source = file.path;
    this.doc.sourcePathNorm = file.path;
    this.doc.sourceMtime = file.stat.mtime;
    this.doc.sourceSize = file.stat.size;
    this.engine.loadStrokes(this.doc.strokes);
    this.cacheValid = false;

    await this.waitImages(2000);
    this.resizeAndRedraw(true);
    this.watchFile(file);
    this.watchResize();
    this.state = this.state === "error" ? "error" : "ready";
    this.rootEl.focus();
  }

  /**
   * Render note like Obsidian Reading View so core/theme CSS applies
   * (headings, lists, callouts, embeds, readable line width, etc.).
   */
  private async renderReadingView(md: string, file: TFile) {
    this.noteEl.empty();
    this.noteEl.removeClass("pyoink-content-source");
    // Classes Obsidian themes target for reading layout
    this.noteEl.addClasses([
      "markdown-preview-view",
      "markdown-rendered",
      "node-insert-event",
      "is-readable-line-width",
      "allow-fold-headings",
      "allow-fold-lists",
    ]);
    // Sizer matches reading-view hierarchy (themes often style this)
    const sizer = this.noteEl.createDiv({
      cls: "markdown-preview-sizer markdown-preview-section",
    });
    // spacer top (reading view often has one)
    sizer.createDiv({
      cls: "markdown-preview-pusher",
      attr: { style: "width: 1px; height: 0.1px; margin-bottom: 0;" },
    });
    await MarkdownRenderer.render(this.app, md, sizer, file.path, this);
    this.wireInternalLinks();
  }

  private wireInternalLinks() {
    this.noteEl.querySelectorAll("a.internal-link").forEach((a) => {
      a.addEventListener("click", (ev) => {
        // Only when navigate mode (content has pointer-events); otherwise canvas captures
        if (!this.gestures.navigateMode) return;
        ev.preventDefault();
        const href = a.getAttribute("data-href") || a.getAttribute("href") || "";
        if (href) {
          void this.app.workspace.openLinkText(href, this.file?.path || "", false);
        }
      });
    });
  }

  private async waitImages(timeoutMs: number) {
    const imgs = Array.from(this.noteEl.querySelectorAll("img"));
    if (!imgs.length) return;
    await Promise.race([
      Promise.all(
        imgs.map(
          (img) =>
            new Promise<void>((res) => {
              if (img.complete) res();
              else {
                img.addEventListener("load", () => res(), { once: true });
                img.addEventListener("error", () => res(), { once: true });
              }
            }),
        ),
      ),
      new Promise<void>((r) => setTimeout(r, timeoutMs)),
    ]);
  }

  private buildToolbar() {
    // ——— Excalidraw-like: compact tool island (draggable) ———
    this.toolbarEl = this.rootEl.createDiv({ cls: "pyoink-toolbar" });
    // Default near bottom-center if never moved
    if (this.plugin.settings.toolbarYPct == null || this.plugin.settings.toolbarYPct > 96) {
      this.plugin.settings.toolbarYPct = 90;
    }
    if (this.plugin.settings.toolbarXPct == null) {
      this.plugin.settings.toolbarXPct = 50;
    }

    const drag = this.toolbarEl.createDiv({ cls: "pyoink-tb-drag" });
    this.bindToolbarDrag(drag);

    const tools = this.toolbarEl.createDiv({ cls: "pyoink-tb-row pyoink-tb-tools" });
    this.iconBtn(tools, "pen", "pen", "Pen");
    this.iconBtn(tools, "highlighter", "highlighter", "Highlighter");
    this.iconBtn(tools, "eraser", "eraser", "Eraser");

    this.navBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.navBtn.title = "Navigate (links)";
    this.setSvgIcon(this.navBtn, "nav");
    this.navBtn.onclick = () => this.setNavigate(!this.gestures.navigateMode);

    const sep = tools.createSpan({ cls: "pyoink-tb-sep" });
    sep.setAttr("aria-hidden", "true");

    this.undoBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.undoBtn.title = "Undo";
    this.setSvgIcon(this.undoBtn, "undo");
    this.undoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.undo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };

    this.redoBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.redoBtn.title = "Redo";
    this.setSvgIcon(this.redoBtn, "redo");
    this.redoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.redo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };

    const zOut = tools.createEl("button", { cls: "pyoink-tb-icon", text: "−" });
    zOut.title = "Zoom out";
    zOut.onclick = () => this.bumpZoom(1 / 1.15);
    const zReset = tools.createEl("button", { cls: "pyoink-tb-icon", text: "1×" });
    zReset.title = "Reset zoom";
    zReset.onclick = () => this.setZoom(1);
    const zIn = tools.createEl("button", { cls: "pyoink-tb-icon", text: "+" });
    zIn.title = "Zoom in";
    zIn.onclick = () => this.bumpZoom(1.15);

    this.zoomBadgeEl = tools.createSpan({ cls: "pyoink-zoom-badge", text: "100%" });
    this.zoomBadgeEl.title = "Current zoom";

    const exit = tools.createEl("button", { cls: "pyoink-tb-icon" });
    exit.title = "Leave (save on exit)";
    this.setSvgIcon(exit, "exit");
    exit.onclick = async () => {
      const ok = await this.flushSave();
      if (!ok && this.dirty) {
        if (!confirm("PyoInk: save failed. Exit anyway?")) return;
      }
      if (this.file) await this.leaf.openFile(this.file);
    };

    this.saveBadgeEl = this.toolbarEl.createDiv({
      cls: "pyoink-status is-saved",
      text: "Saved",
    });
    this.updateStatusChrome();

    // ——— Left properties rail (Excalidraw style panel) ———
    this.propsEl = this.rootEl.createDiv({ cls: "pyoink-props" });
    this.propsToggleBtn = this.propsEl.createEl("button", {
      cls: "pyoink-props-toggle",
      attr: { title: "Style panel", "aria-label": "Toggle style panel" },
    });
    this.propsToggleBtn.textContent = "‹";
    this.propsToggleBtn.onclick = (ev) => {
      ev.preventDefault();
      this.propsCollapsed = !this.propsCollapsed;
      this.syncPropsChrome();
    };

    this.propsBodyEl = this.propsEl.createDiv({ cls: "pyoink-props-body" });
    this.propsBodyEl.createDiv({
      cls: "pyoink-props-title",
      text: "Style",
    });

    this.colorRowEl = this.propsBodyEl.createDiv({
      cls: "pyoink-tb-row pyoink-color-row",
    });
    this.rgbRowEl = this.propsBodyEl.createDiv({
      cls: "pyoink-tb-row pyoink-rgb-row",
    });
    this.widthRowEl = this.propsBodyEl.createDiv({
      cls: "pyoink-tb-row pyoink-width-row",
    });

    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.syncToolbar();
    this.syncPropsChrome();
    this.applyToolbarPos();
  }

  private syncPropsChrome() {
    if (!this.propsEl) return;
    const tool = this.gestures.getTool();
    const hideForNav = this.gestures.navigateMode;
    // Hide entire rail in navigate mode
    this.propsEl.style.display = hideForNav ? "none" : "";
    this.propsEl.classList.toggle("is-collapsed", this.propsCollapsed);
    if (this.propsToggleBtn) {
      this.propsToggleBtn.textContent = this.propsCollapsed ? "›" : "‹";
      this.propsToggleBtn.title = this.propsCollapsed
        ? "Show style panel"
        : "Hide style panel";
    }
    // Eraser: still show width, hide colors
    if (this.colorRowEl) {
      this.colorRowEl.style.display =
        tool === "eraser" || this.propsCollapsed ? "none" : "";
    }
    if (this.rgbRowEl && this.propsCollapsed) {
      this.rgbRowEl.style.display = "none";
    }
  }

  private setSvgIcon(el: HTMLElement, key: string) {
    el.empty();
    el.addClass("pyoink-tb-icon");
    const wrap = el.createSpan({ cls: "pyoink-icon" });
    wrap.innerHTML = TOOLBAR_SVG[key] || TOOLBAR_SVG.pen;
  }

  private iconBtn(parent: HTMLElement, tool: InkTool, iconKey: string, title: string) {
    const b = parent.createEl("button", { cls: "pyoink-tb-icon" });
    b.dataset.tool = tool;
    b.title = title;
    this.setSvgIcon(b, iconKey);
    b.onclick = () => {
      this.finishStrokeIfNeeded();
      this.setTool(tool);
      this.setNavigate(false);
      this.rebuildColorRow();
      this.rebuildRgbRow();
      this.rebuildWidthRow();
      this.syncToolbar();
      this.updateCanvasCursor();
      this.requestRedraw();
    };
  }

  private currentToolColor(): string {
    const tool = this.gestures.getTool();
    if (tool === "highlighter") return this.plugin.settings.highlighterColor;
    return this.plugin.settings.penColor;
  }

  /** @param fromRgb when true, do not rebuild RGB row (sliders are mid-drag). */
  private setToolColor(hex: string, fromRgb = false) {
    const h = this.normalizeHex(hex);
    if (!h) return;
    const tool = this.gestures.getTool();
    if (tool === "highlighter") this.plugin.settings.highlighterColor = h;
    else this.plugin.settings.penColor = h;
    void this.plugin.saveSettings();
    this.rebuildColorRow();
    if (!fromRgb) this.rebuildRgbRow();
    this.updateCanvasCursor();
    this.requestRedraw();
  }

  private normalizeHex(raw: string): string | null {
    let s = String(raw || "").trim();
    if (!s.startsWith("#")) s = "#" + s;
    if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(s)) {
      const r = s[1],
        g = s[2],
        b = s[3];
      return (`#${r}${r}${g}${g}${b}${b}`).toLowerCase();
    }
    return null;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = this.normalizeHex(hex) || "#1a1a1a";
    return {
      r: parseInt(h.slice(1, 3), 16),
      g: parseInt(h.slice(3, 5), 16),
      b: parseInt(h.slice(5, 7), 16),
    };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const c = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${c(r)}${c(g)}${c(b)}`;
  }

  private rebuildColorRow() {
    this.colorRowEl.empty();
    const tool = this.gestures.getTool();
    if (tool === "eraser" || this.gestures.navigateMode) {
      this.colorRowEl.style.display = "none";
      return;
    }
    this.colorRowEl.style.display = "";
    const colors = tool === "highlighter" ? HI_COLORS : PEN_COLORS;
    const cur = this.currentToolColor().toLowerCase();
    for (const c of colors) {
      const b = this.colorRowEl.createEl("button", { cls: "pyoink-swatch" });
      b.style.background = c;
      b.title = c;
      const active = c.toLowerCase() === cur;
      if (active) {
        b.classList.add("is-active");
        const mark = b.createSpan({ cls: "pyoink-swatch-check" });
        mark.innerHTML = TOOLBAR_SVG.check;
      }
      b.onclick = () => {
        this.finishStrokeIfNeeded();
        this.setToolColor(c);
      };
    }
  }

  private rebuildRgbRow() {
    this.rgbRowEl.empty();
    this.rgbPanelEl = null;
    const tool = this.gestures.getTool();
    if (tool === "eraser" || this.gestures.navigateMode) {
      this.rgbRowEl.style.display = "none";
      this.rgbPanelOpen = false;
      return;
    }
    this.rgbRowEl.style.display = "";
    this.rgbRowEl.addClass("pyoink-rgb-row");

    // Current color circle
    const cur = this.currentToolColor();
    const preview = this.rgbRowEl.createEl("button", {
      cls: "pyoink-swatch pyoink-rgb-current",
      attr: { title: cur },
    });
    preview.style.background = cur;

    // Toggle palette panel (circles)
    const toggle = this.rgbRowEl.createEl("button", {
      cls: "pyoink-tb-icon pyoink-rgb-toggle",
      attr: { title: "Color palette" },
    });
    toggle.textContent = "🎨";
    toggle.classList.toggle("is-active", this.rgbPanelOpen);
    toggle.onclick = (ev) => {
      ev.preventDefault();
      this.rgbPanelOpen = !this.rgbPanelOpen;
      this.rebuildRgbRow();
    };

    // Native color input (full RGB spectrum via OS picker)
    const nativeWrap = this.rgbRowEl.createEl("label", {
      cls: "pyoink-rgb-native-wrap",
      attr: { title: "Custom RGB" },
    });
    const native = nativeWrap.createEl("input", {
      type: "color",
      cls: "pyoink-rgb-native",
    });
    native.value = this.normalizeHex(cur) || "#1a1a1a";
    native.oninput = () => {
      this.finishStrokeIfNeeded();
      this.setToolColor(native.value, true);
      preview.style.background = native.value;
      this.paintPaletteActive(native.value);
    };

    if (!this.rgbPanelOpen) return;

    const panel = this.rgbRowEl.createDiv({ cls: "pyoink-rgb-panel" });
    this.rgbPanelEl = panel;
    panel.createDiv({
      cls: "pyoink-rgb-panel-title",
      text: "Pick a color",
    });
    const grid = panel.createDiv({ cls: "pyoink-rgb-grid" });

    for (const hex of this.buildCirclePalette()) {
      const b = grid.createEl("button", {
        cls: "pyoink-swatch pyoink-rgb-circle",
        attr: { title: hex, "data-hex": hex },
      });
      b.style.background = hex;
      if (hex.toLowerCase() === cur.toLowerCase()) {
        b.classList.add("is-active");
        const mark = b.createSpan({ cls: "pyoink-swatch-check" });
        mark.innerHTML = TOOLBAR_SVG.check;
      }
      b.onclick = () => {
        this.finishStrokeIfNeeded();
        this.setToolColor(hex, true);
        preview.style.background = hex;
        native.value = this.normalizeHex(hex) || hex;
        this.paintPaletteActive(hex);
      };
    }
    // Height may grow when panel opens — keep handle reachable
    requestAnimationFrame(() => this.applyToolbarPos());
  }

  private paintPaletteActive(hex: string) {
    const h = (this.normalizeHex(hex) || hex).toLowerCase();
    const root = this.rgbPanelEl || this.rgbRowEl;
    root.querySelectorAll("button.pyoink-rgb-circle").forEach((el) => {
      const b = el as HTMLButtonElement;
      const active = (b.dataset.hex || "").toLowerCase() === h;
      b.classList.toggle("is-active", active);
      const existing = b.querySelector(".pyoink-swatch-check");
      if (active && !existing) {
        const mark = b.createSpan({ cls: "pyoink-swatch-check" });
        mark.innerHTML = TOOLBAR_SVG.check;
      } else if (!active && existing) {
        existing.remove();
      }
    });
  }

  /** Visual RGB circles: neutrals + hue×lightness rings. */
  private buildCirclePalette(): string[] {
    const out: string[] = [];
    const push = (hex: string) => {
      const n = this.normalizeHex(hex);
      if (n && !out.includes(n)) out.push(n);
    };
    // Neutrals
    for (const v of [0, 32, 64, 96, 128, 160, 192, 224, 255]) {
      push(this.rgbToHex(v, v, v));
    }
    // Hue rings (12 hues × 5 lightness levels)
    const hues = 12;
    const lights = [0.28, 0.42, 0.55, 0.68, 0.82];
    const sats = [0.75, 0.55];
    for (const sat of sats) {
      for (const light of lights) {
        for (let i = 0; i < hues; i++) {
          const h = (i / hues) * 360;
          push(this.hslToHex(h, sat, light));
        }
      }
    }
    // Common pen accents
    for (const c of PEN_COLORS) push(c);
    return out;
  }

  private hslToHex(h: number, s: number, l: number): string {
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c);
    };
    return this.rgbToHex(f(0), f(8), f(4));
  }

  private rebuildWidthRow() {
    this.widthRowEl.empty();
    // Size control for pen / highlighter / eraser (all tools)
    if (this.gestures.navigateMode) {
      this.widthRowEl.style.display = "none";
      return;
    }
    this.widthRowEl.style.display = "";
    const tool = this.gestures.getTool();
    const steps = WIDTH_STEPS[tool];
    const cur =
      tool === "eraser"
        ? this.plugin.settings.eraserWidth
        : tool === "highlighter"
          ? this.plugin.settings.highlighterWidth
          : this.plugin.settings.penWidth;
    const idx = nearestWidthStep(tool, cur);
    const toolLabel =
      tool === "eraser" ? "Eraser" : tool === "highlighter" ? "Marker" : "Pen";

    this.widthRowEl.createSpan({
      text: `${toolLabel}`,
      cls: "pyoink-width-label",
    });

    const minus = this.widthRowEl.createEl("button", {
      text: "−",
      cls: "pyoink-width-step",
    });
    minus.title = "Thinner";

    const range = this.widthRowEl.createEl("input", {
      type: "range",
      cls: "pyoink-width-slider",
    });
    range.min = "0";
    range.max = String(steps.length - 1);
    range.step = "1";
    range.value = String(idx);
    range.title = `${toolLabel} size (7 steps)`;

    const plus = this.widthRowEl.createEl("button", {
      text: "+",
      cls: "pyoink-width-step",
    });
    plus.title = "Thicker";

    const val = this.widthRowEl.createSpan({
      text: `${idx + 1}/7`,
      cls: "pyoink-width-val",
    });

    const applyW = (i: number) => {
      const ii = Math.max(0, Math.min(steps.length - 1, Math.round(i)));
      const w = steps[ii];
      this.finishStrokeIfNeeded();
      if (tool === "eraser") this.plugin.settings.eraserWidth = w;
      else if (tool === "highlighter") this.plugin.settings.highlighterWidth = w;
      else this.plugin.settings.penWidth = w;
      void this.plugin.saveSettings();
      range.value = String(ii);
      val.setText(`${ii + 1}/7`);
      this.updateCanvasCursor();
      this.requestRedraw();
    };
    range.oninput = () => applyW(Number(range.value));
    minus.onclick = (ev) => {
      ev.preventDefault();
      applyW(Number(range.value) - 1);
    };
    plus.onclick = (ev) => {
      ev.preventDefault();
      applyW(Number(range.value) + 1);
    };
  }

  private rgbPanelOpen = false;
  private rgbPanelEl: HTMLElement | null = null;

  private finishStrokeIfNeeded() {
    if (!this.engine.isStroking()) return;
    const changed = this.engine.end();
    this.gestures.clearActiveDraw();
    this.state = "ready";
    this.cacheValid = false;
    if (changed) this.markDirty();
    this.requestRedraw();
    this.syncToolbar();
  }

  /** Hard reset input path after tool/nav switch so ink receives pen again. */
  private resetInkInputSurface() {
    this.finishStrokeIfNeeded();
    this.gestures.resetTransient();
    this.scrollTouchId = null;
    this.state = "ready";
    // Drop any stuck captures on the canvas
    try {
      const c = this.canvas;
      // releasePointerCapture needs id; clear via style force is enough for most stuck cases
      c.style.pointerEvents = this.gestures.navigateMode ? "none" : "auto";
    } catch {
      /* */
    }
  }

  setNavigate(on: boolean) {
    this.resetInkInputSurface();
    this.gestures.navigateMode = on;
    this.pageEl.classList.toggle("is-navigate", on);
    this.canvas.classList.toggle("is-pass-through", on);
    // Inline style wins over CSS if a theme/cache left canvas non-interactive
    this.canvas.style.pointerEvents = on ? "none" : "auto";
    if (!on) this.rgbPanelOpen = false;
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.syncToolbar();
    this.updateCanvasCursor();
    this.requestRedraw();
  }

  setTool(t: InkTool) {
    this.resetInkInputSurface();
    this.gestures.setTool(t);
    this.gestures.navigateMode = false;
    this.pageEl.classList.remove("is-navigate");
    this.canvas.classList.remove("is-pass-through");
    this.canvas.style.pointerEvents = "auto";
    this.syncToolbar();
    this.updateCanvasCursor();
  }

  private bindToolbarDrag(handle: HTMLElement) {
    let dragging = false;
    let pid: number | null = null;
    /** Grab offset from toolbar top-left (px, root-local). */
    let grabOffX = 0;
    let grabOffY = 0;

    const onDown = (ev: PointerEvent) => {
      // Only primary button / touch / pen tip
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      dragging = true;
      pid = ev.pointerId;
      this.dragBound = true;
      this.toolbarEl.classList.add("is-dragging");
      const root = this.rootEl.getBoundingClientRect();
      const tb = this.toolbarEl.getBoundingClientRect();
      grabOffX = ev.clientX - tb.left;
      grabOffY = ev.clientY - tb.top;
      try {
        handle.setPointerCapture(ev.pointerId);
      } catch {
        /* */
      }
      // Stop Obsidian leaf/sidebar resize from eating the gesture
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragging || ev.pointerId !== pid) return;
      const root = this.rootEl.getBoundingClientRect();
      // Desired toolbar top-left in root coords
      let left = ev.clientX - root.left - grabOffX;
      let top = ev.clientY - root.top - grabOffY;
      const clamped = this.clampToolbarTopLeft(left, top);
      // Persist as center % for settings (stable-ish across resizes)
      const tbW = this.toolbarEl.offsetWidth || 200;
      const tbH = this.toolbarEl.offsetHeight || 80;
      const cx = clamped.left + tbW / 2;
      const cy = clamped.top + tbH / 2;
      this.plugin.settings.toolbarXPct = (cx / Math.max(1, root.width)) * 100;
      this.plugin.settings.toolbarYPct = (cy / Math.max(1, root.height)) * 100;
      this.applyToolbarPos();
      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();
    };

    const onUp = (ev: PointerEvent) => {
      if (!dragging || ev.pointerId !== pid) return;
      dragging = false;
      pid = null;
      this.dragBound = false;
      this.toolbarEl.classList.remove("is-dragging");
      // Re-clamp after drop (palette may have changed size)
      this.applyToolbarPos();
      void this.plugin.saveSettings();
      try {
        handle.releasePointerCapture(ev.pointerId);
      } catch {
        /* */
      }
      ev.preventDefault();
      ev.stopPropagation();
    };

    // Handle-local down; window capture for move/up so sidebar never steals
    handle.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { capture: true });
    window.addEventListener("pointerup", onUp, { capture: true });
    window.addEventListener("pointercancel", onUp, { capture: true });
  }

  /**
   * Keep the whole remote inside the ink view, with the drag bar always reachable.
   * Uses top-left pixel coords relative to rootEl.
   */
  private clampToolbarTopLeft(left: number, top: number): { left: number; top: number } {
    const rootW = this.rootEl.clientWidth || 1;
    const rootH = this.rootEl.clientHeight || 1;
    const tbW = this.toolbarEl.offsetWidth || 280;
    const tbH = this.toolbarEl.offsetHeight || 56;
    const pad = 12;
    // Leave room for left props rail (~56 when collapsed, ~220 open)
    const leftPad = this.propsCollapsed || this.gestures.navigateMode ? pad : Math.min(230, rootW * 0.4);
    const minTop = pad;
    // Tool island is short — keep fully inside; never under top chrome
    const maxTop = Math.max(minTop, rootH - tbH - pad);
    const minLeft = leftPad;
    const maxLeft = Math.max(minLeft, rootW - tbW - pad);
    return {
      left: Math.min(maxLeft, Math.max(minLeft, left)),
      top: Math.min(maxTop, Math.max(minTop, top)),
    };
  }

  private applyToolbarPos() {
    const rootW = this.rootEl.clientWidth || 1;
    const rootH = this.rootEl.clientHeight || 1;
    const tbW = this.toolbarEl.offsetWidth || 200;
    const tbH = this.toolbarEl.offsetHeight || 80;
    // settings store center %
    let cx = ((this.plugin.settings.toolbarXPct ?? 50) / 100) * rootW;
    let cy = ((this.plugin.settings.toolbarYPct ?? 92) / 100) * rootH;
    let left = cx - tbW / 2;
    let top = cy - tbH / 2;
    const c = this.clampToolbarTopLeft(left, top);
    left = c.left;
    top = c.top;
    // write back clamped center % so reload stays valid
    this.plugin.settings.toolbarXPct = ((left + tbW / 2) / rootW) * 100;
    this.plugin.settings.toolbarYPct = ((top + tbH / 2) / rootH) * 100;
    this.toolbarEl.style.left = `${left}px`;
    this.toolbarEl.style.top = `${top}px`;
    this.toolbarEl.style.right = "auto";
    this.toolbarEl.style.bottom = "auto";
    this.toolbarEl.style.transform = "none";
  }

  private clampZoom(z: number): number {
    const s = this.plugin.settings;
    const min = s.minZoom ?? 0.5;
    const max = s.maxZoom ?? 3;
    return Math.min(max, Math.max(min, z));
  }

  /** Apply CSS zoom; keep focal client point stable when provided. */
  setZoom(next: number, focalClientX?: number, focalClientY?: number) {
    const z1 = this.viewZoom || 1;
    const z2 = this.clampZoom(next);
    if (Math.abs(z2 - z1) < 0.001) {
      this.viewZoom = z2;
      this.gestures.setViewZoom(z2);
      this.applyPageZoom();
      return;
    }

    const scroll = this.scrollEl;
    const srect = scroll.getBoundingClientRect();
    const fx = focalClientX ?? srect.left + srect.width / 2;
    const fy = focalClientY ?? srect.top + srect.height / 2;
    // Content coordinate under focal point before zoom
    const contentX = (scroll.scrollLeft + (fx - srect.left)) / z1;
    const contentY = (scroll.scrollTop + (fy - srect.top)) / z1;

    this.viewZoom = z2;
    this.gestures.setViewZoom(z2);
    this.applyPageZoom();
    this.updateStatusChrome();

    scroll.scrollLeft = contentX * z2 - (fx - srect.left);
    scroll.scrollTop = contentY * z2 - (fy - srect.top);
    this.requestRedraw();
  }

  private bumpZoom(factor: number) {
    this.setZoom(this.viewZoom * factor);
  }

  private applyPageZoom() {
    const z = this.viewZoom || 1;
    const w = this.cssW || this.pageEl.clientWidth || 1;
    const h = this.cssH || this.pageEl.clientHeight || 1;
    if (this.zoomPadEl) {
      this.zoomPadEl.style.width = `${Math.max(1, w * z)}px`;
      this.zoomPadEl.style.height = `${Math.max(1, h * z)}px`;
    }
    this.pageEl.style.width = `${w}px`;
    this.pageEl.style.minHeight = `${h}px`;
    this.pageEl.style.transform = z === 1 ? "" : `scale(${z})`;
    this.pageEl.style.transformOrigin = "0 0";
    this.gestures.setViewZoom(z);
  }

  /**
   * Keep Pencil input path healthy without heavy work on every stroke.
   */
  private ensurePenChannelLive(ev: PointerEvent) {
    // Stop finger fling competing with ink
    if (this.flingRaf) {
      cancelAnimationFrame(this.flingRaf);
      this.flingRaf = 0;
    }
    this.scrollVelX = 0;
    this.scrollVelY = 0;
    if (this.panRaf) {
      cancelAnimationFrame(this.panRaf);
      this.panRaf = 0;
      this.panPendingX = 0;
      this.panPendingY = 0;
    }

    // Drop stuck finger pan capture
    if (this.scrollTouchId != null) {
      const id = this.scrollTouchId;
      this.scrollTouchId = null;
      this.gestures.releasePointer(id, "touch");
      try {
        this.canvas.releasePointerCapture(id);
      } catch {
        /* */
      }
    }

    if (!this.gestures.navigateMode) {
      this.canvas.classList.remove("is-pass-through");
      this.canvas.style.pointerEvents = "auto";
    }

    if (this.state !== "ready" && this.state !== "stroking") {
      this.state = "ready";
    }

    // Orphan engine stroke (ended gesture but engine still active) → commit fast
    if (this.engine.isStroking() && this.gestures.getActiveDrawId() === null) {
      const changed = this.engine.end();
      if (changed) {
        const finished = this.engine.takeLastFinished();
        const dpr = window.devicePixelRatio || 1;
        if (finished && this.cacheCanvas && this.cacheValid && this.cssW > 0) {
          this.engine.stampStrokeToCache(
            this.cacheCanvas,
            finished,
            this.cssW,
            this.cssH,
            dpr,
          );
        } else {
          this.cacheValid = false;
        }
        this.markDirty();
      }
      this.state = "ready";
    }
  }

  /** Start a pen/erase stroke from a pointer event (shared by down + recovered move). */
  private beginInkFromEvent(ev: PointerEvent, rect: DOMRect) {
    try {
      this.canvas.setPointerCapture(ev.pointerId);
    } catch {
      inkLog("E_PTR_NO_CAPTURE");
    }
    this.state = "stroking";
    if (this.saveTimer) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    const sample = this.gestures.sampleFromEvent(ev, rect);
    const tool = this.gestures.getTool();
    if (tool === "eraser") {
      this.engine.beginErase();
      this.engine.eraseAt(sample.x, sample.y, this.eraserRadius());
      this.cacheValid = false;
    } else {
      const color =
        tool === "highlighter"
          ? this.plugin.settings.highlighterColor
          : this.plugin.settings.penColor;
      const size =
        tool === "highlighter"
          ? this.plugin.settings.highlighterWidth
          : this.plugin.settings.penWidth;
      this.engine.beginPen(tool, color, size, [
        sample.x,
        sample.y,
        sample.pressure > 0 ? sample.pressure : 0.5,
        sample.t,
      ]);
    }
    this.requestRedraw();
  }

  cycleTool() {
    this.finishStrokeIfNeeded();
    this.setNavigate(false);
    const order = this.plugin.settings.toolCycle;
    const cur = this.gestures.getTool();
    const i = order.indexOf(cur);
    this.setTool(order[(i + 1) % order.length]);
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.requestRedraw();
  }

  private runFingerAction(action: FingerAction | "cycle_tool") {
    const a = action === "cycle_tool" ? "cycle_tool" : action;
    switch (a) {
      case "none":
        return;
      case "cycle_tool":
        this.cycleTool();
        return;
      case "undo":
        this.finishStrokeIfNeeded();
        if (this.engine.undo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        return;
      case "redo":
        this.finishStrokeIfNeeded();
        if (this.engine.redo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        return;
      case "toggle_nav":
        this.setNavigate(!this.gestures.navigateMode);
        return;
      case "pen":
      case "highlighter":
      case "eraser":
        this.finishStrokeIfNeeded();
        this.setNavigate(false);
        this.setTool(a);
        this.rebuildColorRow();
        this.rebuildRgbRow();
        this.rebuildWidthRow();
        this.syncToolbar();
        this.requestRedraw();
        return;
      case "exit":
        void (async () => {
          const ok = await this.flushSave();
          if (!ok && this.dirty) {
            if (!confirm("PyoInk: save failed. Exit anyway?")) return;
          }
          if (this.file) await this.leaf.openFile(this.file);
        })();
        return;
    }
  }

  private currentBrushRadius(): number {
    const tool = this.gestures.getTool();
    // Match on-canvas feel: radius ≈ half brush size (pen uses size as stroke diam approx)
    if (tool === "eraser") return Math.max(6, this.plugin.settings.eraserWidth / 2);
    if (tool === "highlighter") return Math.max(5, this.plugin.settings.highlighterWidth / 2);
    return Math.max(3, this.plugin.settings.penWidth * 1.35);
  }

  private updateCanvasCursor() {
    if (this.gestures.navigateMode) {
      this.canvas.style.cursor = "pointer";
      return;
    }
    // custom ring drawn on canvas (Apple Pencil hover + mouse)
    this.canvas.style.cursor = "none";
  }

  /**
   * Hover / tip preview — high-contrast so it stays visible on light & dark notes.
   * Outer halo (white+dark) + fill matching tool color.
   */
  private paintCursor(ctx: CanvasRenderingContext2D) {
    if (!this.cursorOn || this.gestures.navigateMode) return;
    if (this.cursorX < 0 || this.cursorY < 0) return;
    const r = this.currentBrushRadius();
    const tool = this.gestures.getTool();
    const x = this.cursorX;
    const y = this.cursorY;
    const ink =
      tool === "eraser"
        ? "#dc3232"
        : tool === "highlighter"
          ? this.plugin.settings.highlighterColor
          : this.plugin.settings.penColor;

    ctx.save();
    // outer contrast rings (always visible)
    ctx.beginPath();
    ctx.arc(x, y, r + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // ink fill + dashed ring for eraser
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (tool === "eraser") {
      ctx.fillStyle = "rgba(220, 50, 50, 0.14)";
      ctx.strokeStyle = "rgba(220, 50, 50, 0.95)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
    } else if (tool === "highlighter") {
      ctx.fillStyle = this.hexAlpha(ink, 0.28);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = this.hexAlpha(ink, 0.22);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
    }
    ctx.fill();
    ctx.stroke();

    // crosshair center (where tip lands)
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2.5;
    const c = Math.min(4, r * 0.45);
    ctx.beginPath();
    ctx.moveTo(x - c, y);
    ctx.lineTo(x + c, y);
    ctx.moveTo(x, y - c);
    ctx.lineTo(x, y + c);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - c, y);
    ctx.lineTo(x + c, y);
    ctx.moveTo(x, y - c);
    ctx.lineTo(x, y + c);
    ctx.stroke();

    // center ink dot
    ctx.beginPath();
    ctx.fillStyle = ink;
    ctx.arc(x, y, 1.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private hexAlpha(hex: string, a: number): string {
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(0,0,0,${a})`;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  private eraserRadius(): number {
    return this.plugin.settings.eraserWidth || 28;
  }

  private syncToolbar() {
    const t = this.gestures.getTool();
    this.toolbarEl.querySelectorAll("button[data-tool]").forEach((el) => {
      (el as HTMLButtonElement).classList.toggle(
        "is-active",
        (el as HTMLButtonElement).dataset.tool === t && !this.gestures.navigateMode,
      );
    });
    if (this.navBtn) this.navBtn.classList.toggle("is-active", this.gestures.navigateMode);
    if (this.undoBtn) this.undoBtn.toggleAttribute("disabled", !this.engine.canUndo());
    if (this.redoBtn) this.redoBtn.toggleAttribute("disabled", !this.engine.canRedo());
    this.syncPropsChrome();
  }

  private bindKeys() {
    this.rootEl.tabIndex = 0;
    this.rootEl.addEventListener("keydown", (ev) => {
      if (ev.key === "t" || ev.key === "T") {
        this.cycleTool();
        ev.preventDefault();
      }
      if (ev.key === "n" || ev.key === "N") {
        this.setNavigate(!this.gestures.navigateMode);
        ev.preventDefault();
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "z") {
        this.finishStrokeIfNeeded();
        if (ev.shiftKey) {
          if (this.engine.redo()) {
            this.cacheValid = false;
            this.markDirty();
            this.requestRedraw();
            this.syncToolbar();
          }
        } else if (this.engine.undo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        ev.preventDefault();
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "y") {
        this.finishStrokeIfNeeded();
        if (this.engine.redo()) {
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          this.syncToolbar();
        }
        ev.preventDefault();
      }
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "s") {
        void this.flushSave();
        ev.preventDefault();
      }
    });
  }

  private bindPointer() {
    const c = this.canvas;

    const stopFling = () => {
      if (this.flingRaf) {
        cancelAnimationFrame(this.flingRaf);
        this.flingRaf = 0;
      }
      this.scrollVelX = 0;
      this.scrollVelY = 0;
    };

    const flushPan = () => {
      this.panRaf = 0;
      if (this.panPendingX === 0 && this.panPendingY === 0) return;
      const dx = this.panPendingX;
      const dy = this.panPendingY;
      this.panPendingX = 0;
      this.panPendingY = 0;
      // Slight gain so ink-mode finger pan feels closer to native note scroll
      const gain = 1.12;
      this.scrollEl.scrollLeft += dx * gain;
      this.scrollEl.scrollTop += dy * gain;
    };

    const queuePan = (dx: number, dy: number) => {
      this.panPendingX += dx;
      this.panPendingY += dy;
      if (!this.panRaf) {
        this.panRaf = requestAnimationFrame(flushPan);
      }
    };

    const startFling = () => {
      stopFling();
      // Convert px/ms → approx px/frame at 60fps, with a bit of boost
      let vx = this.scrollVelX * 16 * 1.15;
      let vy = this.scrollVelY * 16 * 1.15;
      const maxV = 80;
      const sp = Math.hypot(vx, vy);
      if (sp < 1.2) return;
      if (sp > maxV) {
        const s = maxV / sp;
        vx *= s;
        vy *= s;
      }
      const friction = 0.92;
      const step = () => {
        vx *= friction;
        vy *= friction;
        if (Math.hypot(vx, vy) < 0.35) {
          this.flingRaf = 0;
          this.scrollVelX = 0;
          this.scrollVelY = 0;
          return;
        }
        this.scrollEl.scrollLeft += vx;
        this.scrollEl.scrollTop += vy;
        this.flingRaf = requestAnimationFrame(step);
      };
      this.flingRaf = requestAnimationFrame(step);
    };

    const endScroll = (ev: PointerEvent) => {
      if (this.scrollTouchId !== ev.pointerId) return false;
      this.scrollTouchId = null;
      // flush last pan delta then inertia
      if (this.panRaf) {
        cancelAnimationFrame(this.panRaf);
        this.panRaf = 0;
        flushPan();
      }
      startFling();
      // CRITICAL: clear fingerIds left from scroll-only onDown (freeze after N pans)
      this.gestures.releasePointer(ev.pointerId, ev.pointerType);
      try {
        c.releasePointerCapture(ev.pointerId);
      } catch {
        /* */
      }
      return true;
    };

    const forceClearScroll = (reason: string) => {
      if (this.scrollTouchId == null) return;
      const id = this.scrollTouchId;
      this.scrollTouchId = null;
      stopFling();
      if (this.panRaf) {
        cancelAnimationFrame(this.panRaf);
        this.panRaf = 0;
        this.panPendingX = 0;
        this.panPendingY = 0;
      }
      this.gestures.releasePointer(id, "touch");
      try {
        c.releasePointerCapture(id);
      } catch {
        /* */
      }
      inkLog("E_SCROLL_STUCK", reason);
    };

    c.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType === "pen") {
        stopFling();
        this.ensurePenChannelLive(ev);
      } else if (this.state !== "ready" && this.state !== "stroking") {
        return;
      }
      // navigate: non-pen falls through
      if (this.gestures.navigateMode && ev.pointerType !== "pen") return;

      if (this.scrollTouchId != null && this.scrollTouchId !== ev.pointerId) {
        forceClearScroll("new_pointer_down");
      }

      const rect = c.getBoundingClientRect();
      const action = this.gestures.onDown(ev, rect);
      if (action.type === "scroll" && (ev.pointerType === "touch" || ev.pointerType === "mouse")) {
        stopFling();
        this.scrollTouchId = ev.pointerId;
        this.lastScrollY = ev.clientY;
        this.lastScrollX = ev.clientX;
        this.scrollLastT = performance.now();
        this.scrollVelX = 0;
        this.scrollVelY = 0;
        this.panPendingX = 0;
        this.panPendingY = 0;
        try {
          c.setPointerCapture(ev.pointerId);
        } catch {
          /* */
        }
        ev.preventDefault();
        return;
      }
      this.handleGesture(action, ev, rect);
    });

    c.addEventListener("pointermove", (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        const samples =
          typeof ev.getCoalescedEvents === "function" && ev.getCoalescedEvents().length
            ? ev.getCoalescedEvents()
            : [ev];
        let lx = this.lastScrollX;
        let ly = this.lastScrollY;
        let t0 = this.scrollLastT || performance.now();
        let dxSum = 0;
        let dySum = 0;
        for (const s of samples) {
          const dx = lx - s.clientX;
          const dy = ly - s.clientY;
          dxSum += dx;
          dySum += dy;
          lx = s.clientX;
          ly = s.clientY;
        }
        const t1 = performance.now();
        const dt = Math.max(4, t1 - t0);
        const instVx = dxSum / dt;
        const instVy = dySum / dt;
        const a = 0.35;
        this.scrollVelX = this.scrollVelX * (1 - a) + instVx * a;
        this.scrollVelY = this.scrollVelY * (1 - a) + instVy * a;
        this.lastScrollX = lx;
        this.lastScrollY = ly;
        this.scrollLastT = t1;
        queuePan(dxSum, dySum);
        ev.preventDefault();
        return;
      }

      // Recover missed pen-down: contact move without active draw → start ink
      if (
        ev.pointerType === "pen" &&
        ev.buttons > 0 &&
        !this.gestures.navigateMode &&
        !this.gestures.isDrawing() &&
        (this.state === "ready" || this.state === "stroking")
      ) {
        this.ensurePenChannelLive(ev);
        const rect = c.getBoundingClientRect();
        this.gestures.clearActiveDraw();
        const down = this.gestures.onDown(ev, rect);
        if (down.type === "draw-start" || down.type === "erase-start") {
          this.handleGesture(down, ev, rect);
        } else if (!this.engine.isStroking()) {
          this.handleGesture({ type: "draw-start", pointerId: ev.pointerId }, ev, rect);
        }
        ev.preventDefault();
        return;
      }

      if (this.gestures.navigateMode && ev.pointerType !== "pen" && !this.gestures.isDrawing())
        return;
      if (
        (ev.pointerType === "pen" || ev.pointerType === "mouse") &&
        ev.buttons === 0 &&
        !this.gestures.isDrawing()
      ) {
        return;
      }
      const rect = c.getBoundingClientRect();
      const action = this.gestures.onMove(ev, rect);
      this.handleGesture(action, ev, rect);
    });

    const up = (ev: PointerEvent) => {
      if (endScroll(ev)) return;
      const rect = c.getBoundingClientRect();
      const action = this.gestures.onUp(ev, rect);
      this.handleGesture(action, ev, rect);
    };
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", (ev) => {
      if (endScroll(ev)) {
        return;
      }
      const action = this.gestures.onCancel(ev);
      this.handleGesture(action, ev, c.getBoundingClientRect());
    });
    c.addEventListener("lostpointercapture", (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        forceClearScroll("lostpointercapture");
      }
      // If capture lost mid-stroke, end cleanly
      if (this.gestures.getActiveDrawId() === ev.pointerId) {
        const action = this.gestures.onCancel(ev);
        this.handleGesture(action, ev, c.getBoundingClientRect());
      }
    });

    c.addEventListener(
      "wheel",
      (ev) => {
        if (ev.ctrlKey || ev.metaKey) {
          if (this.plugin.settings.enablePinchZoom === false) return;
          // ctrl-wheel = zoom (trackpad pinch on many desktops)
          const factor = ev.deltaY < 0 ? 1.08 : 1 / 1.08;
          this.setZoom(this.viewZoom * factor, ev.clientX, ev.clientY);
          ev.preventDefault();
          return;
        }
        this.scrollEl.scrollTop += ev.deltaY;
        this.scrollEl.scrollLeft += ev.deltaX;
        ev.preventDefault();
      },
      { passive: false },
    );

    // Hover / tip preview (Apple Pencil hover + mouse). Keep high-freq updates.
    const updateHover = (ev: PointerEvent) => {
      if (this.dragBound) return;
      if (this.gestures.navigateMode) return;
      // Only pen/mouse drive the ink preview ring (not multi-touch palms)
      if (ev.pointerType === "touch") return;
      // Accept hover (buttons===0) AND contact
      if (ev.pointerType !== "pen" && ev.pointerType !== "mouse") return;

      const rect = c.getBoundingClientRect();
      const z = this.viewZoom || 1;
      this.cursorX = (ev.clientX - rect.left) / z;
      this.cursorY = (ev.clientY - rect.top) / z;
      this.cursorOn = true;
      if (typeof ev.pressure === "number" && ev.pressure > 0) {
        this.cursorPressure = ev.pressure;
      } else if (ev.buttons === 0) {
        // hover ring uses default pressure look
        this.cursorPressure = 0.5;
      }
      if (this.state === "ready" || this.state === "stroking") this.requestRedraw();
    };
    c.addEventListener("pointermove", updateHover, { capture: true, passive: true });
    // Higher-frequency hover on supporting browsers (Pencil hover)
    c.addEventListener(
      "pointerrawupdate" as keyof HTMLElementEventMap,
      updateHover as EventListener,
      { capture: true, passive: true },
    );
    c.addEventListener(
      "pointerenter",
      (ev) => {
        if (ev.pointerType === "pen" || ev.pointerType === "mouse") {
          this.cursorOn = true;
          updateHover(ev);
          this.updateCanvasCursor();
        }
      },
      { capture: true },
    );
    c.addEventListener(
      "pointerleave",
      (ev) => {
        // Only hide ring when the pen/mouse that drove it leaves
        if (ev.pointerType === "touch") return;
        if (ev.buttons !== 0) return; // still drawing off-canvas with capture
        this.cursorOn = false;
        this.requestRedraw();
      },
      { capture: true },
    );
    // iPad: pen may enter with pointerover before move
    c.addEventListener(
      "pointerover",
      (ev) => {
        if (ev.pointerType === "pen" || ev.pointerType === "mouse") updateHover(ev);
      },
      { capture: true },
    );
    this.updateCanvasCursor();
  }

  private handleGesture(
    action: ReturnType<GestureRouter["onDown"]>,
    ev: PointerEvent,
    rect: DOMRect,
  ) {
    switch (action.type) {
      case "scroll":
      case "ignore":
        return;
      case "pinch": {
        // End any stuck single-finger scroll when pinch starts
        if (this.scrollTouchId != null) {
          const id = this.scrollTouchId;
          this.scrollTouchId = null;
          this.gestures.releasePointer(id, "touch");
          try {
            this.canvas.releasePointerCapture(id);
          } catch {
            /* */
          }
        }
        this.setZoom(action.scale, action.centerClientX, action.centerClientY);
        ev.preventDefault();
        return;
      }
      case "pinch-end":
        return;
      case "navigate-click": {
        const opened = this.clickThrough(action.clientX, action.clientY);
        if (opened) {
          if (this.engine.getActive() || this.engine.isStroking()) {
            this.engine.cancel();
            this.cacheValid = false;
            this.requestRedraw();
          }
          this.gestures.clearActiveDraw();
          this.state = "ready";
          try {
            this.canvas.releasePointerCapture(ev.pointerId);
          } catch {
            /* */
          }
        } else if (this.gestures.isDrawing() || this.engine.getActive()) {
          this.engine.end();
          this.gestures.clearActiveDraw();
          this.state = "ready";
          this.cacheValid = false;
          this.markDirty();
          this.requestRedraw();
          try {
            this.canvas.releasePointerCapture(ev.pointerId);
          } catch {
            /* */
          }
        }
        return;
      }
      case "tool-cycle":
        this.runFingerAction("cycle_tool");
        return;
      case "finger-action":
        this.runFingerAction(action.action);
        return;
      case "pen-double-tap": {
        // 2nd tip: cancel in-progress tip stroke (restores pre-2nd state via undo stack)
        this.engine.cancel();
        this.gestures.clearActiveDraw();
        this.state = "ready";
        // First tip was usually committed as a tiny stroke — remove it once (not cancel+double-pop)
        if (this.engine.canUndo()) {
          this.engine.undo();
          this.markDirty();
        }
        this.invalidateInkCache();
        try {
          this.canvas.releasePointerCapture(action.pointerId);
        } catch {
          /* */
        }
        this.runFingerAction(action.action);
        this.syncToolbar();
        this.requestRedraw();
        return;
      }
      case "pen-single-tap": {
        // Short tip tap configured as non-ink action (or ignore)
        this.engine.cancel();
        this.gestures.clearActiveDraw();
        this.state = "ready";
        try {
          this.canvas.releasePointerCapture(action.pointerId);
        } catch {
          /* */
        }
        if (action.action !== "none") {
          this.runFingerAction(action.action);
        }
        this.syncToolbar();
        this.requestRedraw();
        return;
      }
      case "draw-start":
      case "erase-start": {
        // Hard guard: hand/touch must never ink when pen-only (default)
        if (
          ev.pointerType === "touch" &&
          this.plugin.settings.penOnlyInk !== false
        ) {
          inkLog("E_PALM");
          return;
        }
        try {
          this.canvas.setPointerCapture(ev.pointerId);
        } catch {
          inkLog("E_PTR_NO_CAPTURE");
        }
        this.state = "stroking";
        // Cancel pending disk write so pen stroke never waits on vault I/O
        if (this.saveTimer) {
          window.clearTimeout(this.saveTimer);
          this.saveTimer = null;
        }
        const sample = this.gestures.sampleFromEvent(ev, rect);
        if (action.type === "erase-start" || this.gestures.getTool() === "eraser") {
          this.engine.beginErase();
          this.engine.eraseAt(sample.x, sample.y, this.eraserRadius());
          this.cacheValid = false;
        } else {
          const tool = this.gestures.getTool();
          if (tool === "eraser") {
            this.engine.beginErase();
            this.engine.eraseAt(sample.x, sample.y, this.eraserRadius());
            this.cacheValid = false;
          } else {
            const color =
              tool === "highlighter"
                ? this.plugin.settings.highlighterColor
                : this.plugin.settings.penColor;
            const size =
              tool === "highlighter"
                ? this.plugin.settings.highlighterWidth
                : this.plugin.settings.penWidth;
            this.engine.beginPen(tool, color, size, [
              sample.x,
              sample.y,
              sample.pressure || 0.5,
              sample.t,
            ]);
          }
        }
        this.requestRedraw();
        ev.preventDefault();
        return;
      }
      case "draw-move": {
        if (this.gestures.getTool() === "eraser" || this.engine.getActive() === null) {
          for (const s of action.samples) this.engine.eraseAt(s.x, s.y, this.eraserRadius());
          this.cacheValid = false;
        } else {
          this.engine.extend(action.samples);
        }
        this.requestRedraw();
        ev.preventDefault();
        return;
      }
      case "draw-end": {
        const changed = this.engine.end();
        this.state = "ready";
        if (changed) {
          this.markDirty();
          // Fast path: stamp finished stroke onto cache instead of full rebuild
          const finished = this.engine.takeLastFinished();
          const dpr = window.devicePixelRatio || 1;
          if (finished && this.cacheCanvas && this.cacheValid && this.cssW > 0) {
            this.engine.stampStrokeToCache(
              this.cacheCanvas,
              finished,
              this.cssW,
              this.cssH,
              dpr,
            );
          } else {
            this.cacheValid = false;
          }
        }
        // Avoid full toolbar rebuild every stroke (was lag after each lift)
        if (this.undoBtn) this.undoBtn.toggleAttribute("disabled", !this.engine.canUndo());
        if (this.redoBtn) this.redoBtn.toggleAttribute("disabled", !this.engine.canRedo());
        this.requestRedraw();
        try {
          this.canvas.releasePointerCapture(ev.pointerId);
        } catch {
          /* */
        }
        if (this.remoteNewer && !this.dirty) void this.reloadFromDisk();
        return;
      }
    }
  }

  /** Click under transparent canvas onto markdown (links etc.). Returns true if a link was opened. */
  private clickThrough(clientX: number, clientY: number): boolean {
    const prev = this.canvas.style.pointerEvents;
    this.canvas.style.pointerEvents = "none";
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    this.canvas.style.pointerEvents = this.gestures.navigateMode ? "none" : prev || "auto";
    if (!el) return false;
    const link = el.closest("a") as HTMLAnchorElement | null;
    if (link) {
      const internal = link.classList.contains("internal-link");
      const href = link.getAttribute("data-href") || link.getAttribute("href") || "";
      if (internal && href) {
        void this.app.workspace.openLinkText(href, this.file?.path || "", false);
        return true;
      }
      if (href) {
        window.open(href, "_blank");
        return true;
      }
    }
    return false;
  }

  private markDirty() {
    this.dirty = true;
    this.updateStatusChrome();
    // Never hit disk mid-stroke; only after idle
    if (this.engine.isStroking() || this.state === "stroking") return;
    this.scheduleSave();
  }

  /** Full cache rebuild required (undo/redo/erase/load). */
  private invalidateInkCache() {
    this.cacheValid = false;
  }

  private scheduleSave() {
    // 12s idle with no ink activity, or leave screen
    const ms = Math.max(12000, this.plugin.settings.debounceMs || 12000);
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      if (this.engine.isStroking() || this.state === "stroking") {
        this.scheduleSave();
        return;
      }
      void this.flushSave();
    }, ms);
  }

  async flushSave(): Promise<boolean> {
    if (!this.file) return true;
    if (!this.dirty && !this.store.isSaving() && !this.store.hasPendingWrite()) return true;
    if (this.engine.isStroking()) {
      this.engine.end();
      this.invalidateInkCache();
    }
    this.state = "saving";
    this.updateStatusChrome();
    const live = measureLayout(
      this.pageEl,
      this.file.stat.mtime,
      this.file.stat.size,
      this.plugin.settings.maxCanvasCssHeight,
    );
    this.doc.source = this.file.path;
    this.doc.sourcePathNorm = this.file.path;
    this.doc.sourceMtime = this.file.stat.mtime;
    this.doc.sourceSize = this.file.stat.size;
    this.doc.layout = {
      cssWidth: live.cssWidth,
      contentHeight: live.contentHeight,
      dpr: live.dpr,
      snapshotAt: Date.now(),
    };
    this.doc.strokes = this.engine.exportStrokes();
    this.doc.meta.appVersion = "0.3.3";
    this.doc.settingsEcho = { penWidth: this.plugin.settings.penWidth, pfVersion: "1.2.3" };
    if (this.remoteNewer && this.dirty) {
      new Notice("PyoInk: remote ink changed — saving local will overwrite");
    }
    // store.save awaits full queue drain of latest snapshot
    const ok = await this.store.save(this.doc);
    if (ok) {
      this.dirty = false;
      this.remoteNewer = false;
    }
    this.state = "ready";
    this.updateStatusChrome();
    return ok;
  }

  private updateStatusChrome() {
    if (this.saveBadgeEl) {
      if (this.state === "saving" || this.store.isSaving()) {
        this.saveBadgeEl.setText("Saving…");
        this.saveBadgeEl.className = "pyoink-status is-saving";
      } else if (this.dirty) {
        this.saveBadgeEl.setText("Unsaved");
        this.saveBadgeEl.className = "pyoink-status is-dirty";
      } else {
        this.saveBadgeEl.setText("Saved");
        this.saveBadgeEl.className = "pyoink-status is-saved";
      }
    }
    if (this.zoomBadgeEl) {
      const pct = Math.round((this.viewZoom || 1) * 100);
      this.zoomBadgeEl.setText(`${pct}%`);
    }
  }

  private async reloadFromDisk() {
    if (!this.file || this.dirty || this.engine.isStroking()) return;
    const loaded = await this.store.load(this.file.path);
    this.doc = loaded.doc;
    this.engine.loadStrokes(this.doc.strokes);
    this.cacheValid = false;
    this.requestRedraw();
    new Notice("PyoInk: reloaded ink from disk");
  }

  private watchFile(file: TFile) {
    const inkPath = this.store.pathFor(file.path);
    const ref = this.app.vault.on("modify", (f) => {
      if (!(f instanceof TFile)) return;
      if (f.path === inkPath || f.path.endsWith(".hink.json")) {
        if (this.engine.isStroking()) {
          this.remoteNewer = true;
          return;
        }
        if (this.dirty) {
          this.remoteNewer = true;
          new Notice("PyoInk: remote/disk ink changed while dirty — save may overwrite");
          return;
        }
        if (f.stat.mtime > this.store.getLoadedMtime()) void this.reloadFromDisk();
      }
      // note body edits ignored for badge (simplified UI)
    });
    this.unsubModify = () => this.app.vault.offref(ref);
  }

  private watchResize() {
    this.resizeObs = new ResizeObserver(() => {
      this.resizeAndRedraw(false);
    });
    this.resizeObs.observe(this.pageEl);
  }

  private teardownWatchers() {
    if (this.unsubModify) {
      this.unsubModify();
      this.unsubModify = null;
    }
    if (this.resizeObs) {
      this.resizeObs.disconnect();
      this.resizeObs = null;
    }
  }

  private resizeAndRedraw(forceCache: boolean) {
    if (!this.file) return;
    // measure content natural size
    const contentW = Math.max(this.noteEl.scrollWidth, this.noteEl.clientWidth, this.scrollEl.clientWidth, 1);
    let contentH = Math.max(this.noteEl.scrollHeight, this.noteEl.clientHeight, this.scrollEl.clientHeight, 1);
    if (contentH > this.plugin.settings.maxCanvasCssHeight) {
      contentH = this.plugin.settings.maxCanvasCssHeight;
      inkLog("E_CANVAS_MAX", contentH);
    }
    let w = contentW;
    let h = contentH;
    const dpr = window.devicePixelRatio || 1;
    if (w * h * dpr * dpr > 16_000_000) {
      const scale = Math.sqrt(16_000_000 / (w * h * dpr * dpr));
      w = Math.floor(w * scale);
      h = Math.floor(h * scale);
      inkLog("E_CANVAS_MAX", { w, h });
    }
    this.cssW = w;
    this.cssH = h;
    this.pageEl.style.width = `${w}px`;
    this.pageEl.style.minHeight = `${h}px`;
    this.applyPageZoom();

    this.canvas.width = Math.max(1, Math.floor(w * dpr));
    this.canvas.height = Math.max(1, Math.floor(h * dpr));
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // transparent clear
    this.ctx.clearRect(0, 0, w, h);

    if (forceCache || !this.cacheValid) {
      if (this.cacheCanvas) this.engine.rebuildCache(this.cacheCanvas, w, h, dpr);
      this.cacheValid = true;
    }
    this.requestRedraw();
  }

  private requestRedraw() {
    this.needRedraw = true;
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      if (!this.needRedraw) return;
      this.needRedraw = false;
      this.engine.setSettings(this.plugin.settings);
      if (!this.cacheValid && this.cacheCanvas) {
        this.engine.rebuildCache(this.cacheCanvas, this.cssW, this.cssH, window.devicePixelRatio || 1);
        this.cacheValid = true;
      }
      // ensure transparent background each frame
      this.ctx.clearRect(0, 0, this.cssW, this.cssH);
      this.engine.draw(this.ctx, this.cssW, this.cssH, this.cacheCanvas, this.cacheValid);
      this.paintCursor(this.ctx);
    });
  }
}
