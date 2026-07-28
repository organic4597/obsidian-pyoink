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
import { HI_COLORS, PEN_COLORS, type FingerAction } from "../util/settings";
import { inkLog } from "../util/errors";

/** 7-step brush widths per tool (index 0–6). */
const WIDTH_STEPS: Record<"pen" | "highlighter" | "eraser", number[]> = {
  pen: [1.0, 1.6, 2.2, 3.0, 4.0, 5.5, 8.0],
  highlighter: [8, 12, 16, 20, 26, 34, 44],
  eraser: [12, 18, 24, 32, 42, 56, 72],
};

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
  private pageEl!: HTMLElement;
  private noteEl!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private cacheCanvas: HTMLCanvasElement | null = null;
  private cacheValid = false;
  private toolbarEl!: HTMLElement;
  private colorRowEl!: HTMLElement;
  private rgbRowEl!: HTMLElement;
  private navBtn: HTMLButtonElement | null = null;
  private dragBound = false;
  private cursorX = -1;
  private cursorY = -1;
  private cursorOn = false;
  /** Apple Pencil / pen hover pressure (0 when unknown). */
  private cursorPressure = 0.5;
  private undoBtn: HTMLButtonElement | null = null;
  private redoBtn: HTMLButtonElement | null = null;
  private widthRowEl!: HTMLElement;

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
    // page = content + transparent canvas stacked
    this.pageEl = this.scrollEl.createDiv({ cls: "pyoink-page" });
    this.noteEl = this.pageEl.createDiv({ cls: "pyoink-content" });
    this.canvas = this.pageEl.createEl("canvas", { cls: "pyoink-canvas" });
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2d unavailable");
    this.ctx = ctx;
    this.cacheCanvas = document.createElement("canvas");
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
    this.syncToolbar();
    this.noteEl.empty();

    try {
      const md = await this.app.vault.read(file);
      await MarkdownRenderer.render(this.app, md, this.noteEl, file.path, this);
      // internal links: make them work when navigate mode / click-through
      this.wireInternalLinks();
    } catch (e) {
      inkLog("E_RENDER", e);
      this.state = "error";
      this.noteEl.setText("(render failed)\n\n" + (await this.app.vault.read(file).catch(() => "")));
      new Notice("PyoInk: markdown render failed — showing raw");
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

  private wireInternalLinks() {
    this.noteEl.querySelectorAll("a.internal-link").forEach((a) => {
      a.addEventListener("click", (ev) => {
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
    this.toolbarEl = this.rootEl.createDiv({ cls: "pyoink-toolbar" });
    this.applyToolbarPos();

    const drag = this.toolbarEl.createDiv({ cls: "pyoink-tb-drag" });
    this.bindToolbarDrag(drag);

    const tools = this.toolbarEl.createDiv({ cls: "pyoink-tb-row" });
    this.iconBtn(tools, "pen", "pen", "Pen");
    this.iconBtn(tools, "highlighter", "highlighter", "Highlighter");
    this.iconBtn(tools, "eraser", "eraser", "Eraser");

    this.navBtn = tools.createEl("button", { cls: "pyoink-tb-icon" });
    this.navBtn.title = "Navigate (links)";
    this.setSvgIcon(this.navBtn, "nav");
    this.navBtn.onclick = () => this.setNavigate(!this.gestures.navigateMode);

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

    this.colorRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row pyoink-color-row" });
    this.rgbRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row pyoink-rgb-row" });
    this.widthRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row pyoink-width-row" });
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.syncToolbar();
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
    const tool = this.gestures.getTool();
    if (tool === "eraser" || this.gestures.navigateMode) {
      this.rgbRowEl.style.display = "none";
      return;
    }
    this.rgbRowEl.style.display = "";
    const { r, g, b } = this.hexToRgb(this.currentToolColor());
    const preview = this.rgbRowEl.createDiv({ cls: "pyoink-rgb-preview" });
    preview.style.background = this.currentToolColor();

    const mk = (label: string, value: number, onChange: (n: number) => void) => {
      const cell = this.rgbRowEl.createDiv({ cls: "pyoink-rgb-cell" });
      cell.createSpan({ text: label, cls: "pyoink-rgb-label" });
      const range = cell.createEl("input", { type: "range", cls: "pyoink-rgb-slider" });
      range.min = "0";
      range.max = "255";
      range.step = "1";
      range.value = String(value);
      const num = cell.createEl("input", { type: "number", cls: "pyoink-rgb-num" });
      num.min = "0";
      num.max = "255";
      num.step = "1";
      num.value = String(value);
      const sync = (n: number) => {
        const v = Math.max(0, Math.min(255, Math.round(n)));
        range.value = String(v);
        num.value = String(v);
        onChange(v);
      };
      range.oninput = () => sync(Number(range.value));
      num.onchange = () => sync(Number(num.value));
      return { range, num, sync };
    };

    let rr = r,
      gg = g,
      bb = b;
    const apply = () => {
      const hex = this.rgbToHex(rr, gg, bb);
      preview.style.background = hex;
      this.finishStrokeIfNeeded();
      this.setToolColor(hex, true);
    };
    mk("R", r, (n) => {
      rr = n;
      apply();
    });
    mk("G", g, (n) => {
      gg = n;
      apply();
    });
    mk("B", b, (n) => {
      bb = n;
      apply();
    });
  }

  private widthStepsForTool(tool: InkTool): number[] {
    if (tool === "eraser") return WIDTH_STEPS.eraser;
    if (tool === "highlighter") return WIDTH_STEPS.highlighter;
    return WIDTH_STEPS.pen;
  }

  private nearestWidthStep(tool: InkTool, cur: number): number {
    const steps = this.widthStepsForTool(tool);
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

  private rebuildWidthRow() {
    this.widthRowEl.empty();
    if (this.gestures.navigateMode) {
      this.widthRowEl.style.display = "none";
      return;
    }
    this.widthRowEl.style.display = "";
    const tool = this.gestures.getTool();
    const steps = this.widthStepsForTool(tool);
    const cur =
      tool === "eraser"
        ? this.plugin.settings.eraserWidth
        : tool === "highlighter"
          ? this.plugin.settings.highlighterWidth
          : this.plugin.settings.penWidth;
    const idx = this.nearestWidthStep(tool, cur);

    this.widthRowEl.createSpan({ text: "Size", cls: "pyoink-width-label" });
    const range = this.widthRowEl.createEl("input", {
      type: "range",
      cls: "pyoink-width-slider",
    });
    range.min = "0";
    range.max = String(steps.length - 1);
    range.step = "1";
    range.value = String(idx);
    range.title = "Stroke width (7 steps)";
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
      val.setText(`${ii + 1}/7`);
      this.updateCanvasCursor();
      this.requestRedraw();
    };
    range.oninput = () => applyW(Number(range.value));
  }

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

  private applyToolbarPos() {
    const x = this.plugin.settings.toolbarXPct ?? 50;
    const y = this.plugin.settings.toolbarYPct ?? 92;
    this.toolbarEl.style.left = `${x}%`;
    this.toolbarEl.style.top = `${y}%`;
    this.toolbarEl.style.bottom = "auto";
    this.toolbarEl.style.transform = "translate(-50%, -50%)";
  }

  private bindToolbarDrag(handle: HTMLElement) {
    let dragging = false;
    let pid: number | null = null;
    const onDown = (ev: PointerEvent) => {
      dragging = true;
      pid = ev.pointerId;
      this.dragBound = true;
      this.toolbarEl.classList.add("is-dragging");
      handle.setPointerCapture(ev.pointerId);
      ev.preventDefault();
      ev.stopPropagation();
    };
    const onMove = (ev: PointerEvent) => {
      if (!dragging || ev.pointerId !== pid) return;
      const rect = this.rootEl.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      this.plugin.settings.toolbarXPct = Math.min(95, Math.max(5, x));
      this.plugin.settings.toolbarYPct = Math.min(95, Math.max(5, y));
      this.applyToolbarPos();
      ev.preventDefault();
    };
    const onUp = (ev: PointerEvent) => {
      if (!dragging || ev.pointerId !== pid) return;
      dragging = false;
      pid = null;
      this.dragBound = false;
      this.toolbarEl.classList.remove("is-dragging");
      void this.plugin.saveSettings();
      try {
        handle.releasePointerCapture(ev.pointerId);
      } catch {
        /* */
      }
    };
    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  setNavigate(on: boolean) {
    this.gestures.navigateMode = on;
    this.pageEl.classList.toggle("is-navigate", on);
    this.canvas.classList.toggle("is-pass-through", on);
    this.rebuildColorRow();
    this.rebuildRgbRow();
    this.rebuildWidthRow();
    this.syncToolbar();
    this.updateCanvasCursor();
    this.requestRedraw();
  }

  setTool(t: InkTool) {
    this.gestures.setTool(t);
    this.syncToolbar();
    this.updateCanvasCursor();
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

    c.addEventListener("pointerdown", (ev) => {
      if (this.state !== "ready" && this.state !== "stroking") return;
      // navigate: let events fall through (canvas pass-through CSS)
      if (this.gestures.navigateMode && ev.pointerType !== "pen") return;

      const rect = c.getBoundingClientRect();
      const action = this.gestures.onDown(ev, rect);
      if (action.type === "scroll" && ev.pointerType === "touch") {
        this.scrollTouchId = ev.pointerId;
        this.lastScrollY = ev.clientY;
        this.lastScrollX = ev.clientX;
        return;
      }
      this.handleGesture(action, ev, rect);
    });

    c.addEventListener("pointermove", (ev) => {
      if (this.scrollTouchId === ev.pointerId) {
        this.scrollEl.scrollTop += this.lastScrollY - ev.clientY;
        this.scrollEl.scrollLeft += this.lastScrollX - ev.clientX;
        this.lastScrollY = ev.clientY;
        this.lastScrollX = ev.clientX;
        return;
      }
      if (this.gestures.navigateMode && ev.pointerType !== "pen" && !this.gestures.isDrawing()) return;
      const rect = c.getBoundingClientRect();
      const action = this.gestures.onMove(ev, rect);
      this.handleGesture(action, ev, rect);
    });

    const up = (ev: PointerEvent) => {
      if (this.scrollTouchId === ev.pointerId) {
        this.scrollTouchId = null;
        return;
      }
      const rect = c.getBoundingClientRect();
      const action = this.gestures.onUp(ev, rect);
      this.handleGesture(action, ev, rect);
    };
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", (ev) => {
      if (this.scrollTouchId === ev.pointerId) this.scrollTouchId = null;
      const action = this.gestures.onCancel(ev);
      this.handleGesture(action, ev, c.getBoundingClientRect());
    });

    c.addEventListener(
      "wheel",
      (ev) => {
        this.scrollEl.scrollTop += ev.deltaY;
        this.scrollEl.scrollLeft += ev.deltaX;
        ev.preventDefault();
      },
      { passive: false },
    );

    // Hover / tip preview (Apple Pencil hover + mouse). Keep high-freq updates.
    const updateHover = (ev: PointerEvent) => {
      if (this.dragBound) return;
      // Only pen/mouse drive the ink preview ring (not multi-touch palms)
      if (ev.pointerType === "touch" && this.plugin.settings.penOnlyInk !== false) {
        return;
      }
      const rect = c.getBoundingClientRect();
      this.cursorX = ev.clientX - rect.left;
      this.cursorY = ev.clientY - rect.top;
      this.cursorOn = true;
      if (typeof ev.pressure === "number" && ev.pressure > 0) {
        this.cursorPressure = ev.pressure;
      }
      // Hover when buttons===0; also keep ring while drawing
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
        this.cursorOn = true;
        updateHover(ev);
        this.updateCanvasCursor();
      },
      { capture: true },
    );
    c.addEventListener(
      "pointerleave",
      () => {
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
        this.cacheValid = false;
        if (changed) this.markDirty();
        this.syncToolbar();
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
    // Never hit disk mid-stroke; only after idle
    if (this.engine.isStroking() || this.state === "stroking") return;
    this.scheduleSave();
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
    if (!this.dirty && !this.store.isSaving()) return true;
    if (this.engine.isStroking()) {
      this.engine.end();
      this.cacheValid = false;
    }
    this.state = "saving";
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
    this.doc.settingsEcho = { penWidth: this.plugin.settings.penWidth, pfVersion: "1.2.3" };
    if (this.remoteNewer && this.dirty) {
      new Notice("PyoInk: remote ink changed — saving local will overwrite");
    }
    const ok = await this.store.save(this.doc);
    if (ok) {
      this.dirty = false;
      this.remoteNewer = false;
    }
    if (this.store.consumePending()) return this.flushSave();
    this.state = "ready";
    return ok;
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
