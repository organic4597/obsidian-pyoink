import {
  ItemView,
  MarkdownRenderer,
  Notice,
  TFile,
  WorkspaceLeaf,
  setIcon,
} from "obsidian";
import type PyoInkPlugin from "../../main";
import { StrokeEngine } from "../engine/StrokeEngine";
import { GestureRouter } from "../input/GestureRouter";
import { measureLayout } from "../layout/LayoutSnapshot";
import { emptyDoc, type InkDocV1 } from "../store/schema";
import { InkStore } from "../store/InkStore";
import type { InkTool } from "../util/settings";
import { HI_COLORS, PEN_COLORS } from "../util/settings";
import { inkLog } from "../util/errors";

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
  private navBtn: HTMLButtonElement | null = null;
  private dragBound = false;
  private cursorX = -1;
  private cursorY = -1;
  private cursorOn = false;
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
    this.iconBtn(tools, "pen", "pencil", "Pen");
    this.iconBtn(tools, "highlighter", "highlighter", "Highlighter");
    this.iconBtn(tools, "eraser", "eraser", "Eraser");

    this.navBtn = tools.createEl("button");
    this.navBtn.title = "Navigate (links)";
    setIcon(this.navBtn, "mouse-pointer-click");
    this.navBtn.onclick = () => this.setNavigate(!this.gestures.navigateMode);

    this.undoBtn = tools.createEl("button");
    this.undoBtn.title = "Undo";
    setIcon(this.undoBtn, "undo-2");
    this.undoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.undo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };

    this.redoBtn = tools.createEl("button");
    this.redoBtn.title = "Redo";
    setIcon(this.redoBtn, "redo-2");
    this.redoBtn.onclick = () => {
      this.finishStrokeIfNeeded();
      if (this.engine.redo()) {
        this.cacheValid = false;
        this.markDirty();
        this.requestRedraw();
        this.syncToolbar();
      }
    };

    const exit = tools.createEl("button");
    exit.title = "Leave (save on exit)";
    setIcon(exit, "log-out");
    exit.onclick = async () => {
      const ok = await this.flushSave();
      if (!ok && this.dirty) {
        if (!confirm("PyoInk: save failed. Exit anyway?")) return;
      }
      if (this.file) await this.leaf.openFile(this.file);
    };

    this.colorRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row" });
    this.widthRowEl = this.toolbarEl.createDiv({ cls: "pyoink-tb-row" });
    this.rebuildColorRow();
    this.rebuildWidthRow();
    this.syncToolbar();
  }

  private iconBtn(parent: HTMLElement, tool: InkTool, icon: string, title: string) {
    const b = parent.createEl("button");
    b.dataset.tool = tool;
    b.title = title;
    setIcon(b, icon);
    b.onclick = () => {
      this.finishStrokeIfNeeded();
      this.setTool(tool);
      this.setNavigate(false);
      this.rebuildColorRow();
      this.rebuildWidthRow();
      this.syncToolbar();
      this.updateCanvasCursor();
    };
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
    const cur =
      tool === "highlighter"
        ? this.plugin.settings.highlighterColor
        : this.plugin.settings.penColor;
    for (const c of colors) {
      const b = this.colorRowEl.createEl("button", { cls: "pyoink-swatch" });
      b.style.background = c;
      b.title = c;
      if (c.toLowerCase() === String(cur).toLowerCase()) b.classList.add("is-active");
      b.onclick = () => {
        this.finishStrokeIfNeeded();
        if (tool === "highlighter") this.plugin.settings.highlighterColor = c;
        else this.plugin.settings.penColor = c;
        void this.plugin.saveSettings();
        this.rebuildColorRow();
        this.updateCanvasCursor();
      };
    }
  }

  private rebuildWidthRow() {
    this.widthRowEl.empty();
    if (this.gestures.navigateMode) {
      this.widthRowEl.style.display = "none";
      return;
    }
    this.widthRowEl.style.display = "";
    const tool = this.gestures.getTool();
    const presets =
      tool === "eraser"
        ? ([["S", 16], ["M", 28], ["L", 48]] as const)
        : tool === "highlighter"
          ? ([["S", 10], ["M", 16], ["L", 28]] as const)
          : ([["S", 1.6], ["M", 2.4], ["L", 4.5]] as const);
    const cur =
      tool === "eraser"
        ? this.plugin.settings.eraserWidth
        : tool === "highlighter"
          ? this.plugin.settings.highlighterWidth
          : this.plugin.settings.penWidth;
    for (const [label, w] of presets) {
      const b = this.widthRowEl.createEl("button", { text: label, cls: "pyoink-width-btn" });
      b.dataset.w = label;
      // nearest preset active
      const dists = presets.map((p) => Math.abs(p[1] - cur));
      const best = dists.indexOf(Math.min(...dists));
      if (presets[best][0] === label) b.classList.add("is-active");
      b.onclick = () => {
        this.finishStrokeIfNeeded();
        if (tool === "eraser") this.plugin.settings.eraserWidth = w;
        else if (tool === "highlighter") this.plugin.settings.highlighterWidth = w;
        else this.plugin.settings.penWidth = w;
        void this.plugin.saveSettings();
        this.rebuildWidthRow();
        this.updateCanvasCursor();
        this.requestRedraw();
      };
    }
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
    this.rebuildWidthRow();
    this.syncToolbar();
    this.updateCanvasCursor();
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
    this.rebuildWidthRow();
  }

  private currentBrushRadius(): number {
    const tool = this.gestures.getTool();
    if (tool === "eraser") return this.plugin.settings.eraserWidth / 2;
    if (tool === "highlighter") return this.plugin.settings.highlighterWidth / 2;
    return Math.max(4, this.plugin.settings.penWidth * 2);
  }

  private updateCanvasCursor() {
    if (this.gestures.navigateMode) {
      this.canvas.style.cursor = "pointer";
      return;
    }
    // custom ring drawn on canvas
    this.canvas.style.cursor = "none";
  }

  private paintCursor(ctx: CanvasRenderingContext2D) {
    if (!this.cursorOn || this.gestures.navigateMode) return;
    if (this.cursorX < 0 || this.cursorY < 0) return;
    const r = this.currentBrushRadius();
    const tool = this.gestures.getTool();
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.cursorX, this.cursorY, r, 0, Math.PI * 2);
    if (tool === "eraser") {
      ctx.strokeStyle = "rgba(220, 50, 50, 0.95)";
      ctx.fillStyle = "rgba(220, 50, 50, 0.12)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
    } else if (tool === "highlighter") {
      ctx.strokeStyle = this.plugin.settings.highlighterColor;
      ctx.fillStyle = this.hexAlpha(this.plugin.settings.highlighterColor, 0.25);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = this.plugin.settings.penColor;
      ctx.fillStyle = this.hexAlpha(this.plugin.settings.penColor, 0.18);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
    }
    ctx.fill();
    ctx.stroke();
    // center dot
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.fillStyle = tool === "eraser" ? "rgba(220,50,50,0.9)" : this.plugin.settings.penColor;
    if (tool === "highlighter") ctx.fillStyle = this.plugin.settings.highlighterColor;
    ctx.arc(this.cursorX, this.cursorY, 1.5, 0, Math.PI * 2);
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

    c.addEventListener("pointermove", (ev) => {
      // hover preview (also fires while drawing)
      const rect = c.getBoundingClientRect();
      this.cursorX = ev.clientX - rect.left;
      this.cursorY = ev.clientY - rect.top;
      this.cursorOn = true;
      if (!this.gestures.isDrawing() && this.state === "ready") this.requestRedraw();
    }, { capture: true });
    c.addEventListener("pointerenter", () => {
      this.cursorOn = true;
      this.updateCanvasCursor();
    });
    c.addEventListener("pointerleave", () => {
      this.cursorOn = false;
      this.requestRedraw();
    });
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
        this.cycleTool();
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
