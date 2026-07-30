import { Notice, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";
import { PyoInkView, VIEW_TYPE_PYOINK } from "./src/view/PyoInkView";
import {
  DEFAULT_SETTINGS,
  FINGER_ACTION_LABELS,
  PENCIL_SINGLE_TAP_LABELS,
  sanitizeSettings,
  type FingerAction,
  type PencilSingleTapAction,
  type PyoInkSettings,
} from "./src/util/settings";
import { isInkableFile } from "./src/util/media";

export default class PyoInkPlugin extends Plugin {
  settings: PyoInkSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(VIEW_TYPE_PYOINK, (leaf) => new PyoInkView(leaf, this));

    this.addCommand({
      id: "open-pyoink-current",
      name: "Open PyoInk on current file",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!isInkableFile(file)) return false;
        if (!checking) void this.openInk(file!);
        return true;
      },
    });

    this.addRibbonIcon("pen-tool", "PyoInk", async () => {
      const file = this.app.workspace.getActiveFile();
      if (!isInkableFile(file)) {
        new Notice("PyoInk: open a Markdown, PDF, or image file first");
        return;
      }
      await this.openInk(file!);
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile) || !isInkableFile(file)) return;
        menu.addItem((item) => {
          item
            .setTitle("Open with PyoInk")
            .setIcon("pen-tool")
            .onClick(() => void this.openInk(file));
        });
      }),
    );

    this.addSettingTab(new PyoInkSettingTab(this));
  }

  getActiveInkView(): PyoInkView | null {
    for (const l of this.app.workspace.getLeavesOfType(VIEW_TYPE_PYOINK)) {
      if (l.view instanceof PyoInkView) return l.view;
    }
    return null;
  }

  /**
   * Open PyoInk on a note.
   * Default: replace the current tab (less jarring). Optional: new tab.
   * Reuses an existing PyoInk leaf that already shows the same file.
   */
  async openInk(file: TFile) {
    // Reuse existing PyoInk leaf for this file
    for (const l of this.app.workspace.getLeavesOfType(VIEW_TYPE_PYOINK)) {
      const v = l.view;
      if (v instanceof PyoInkView && v.file?.path === file.path) {
        this.app.workspace.setActiveLeaf(l, { focus: true });
        await v.openFile(file);
        return;
      }
    }

    const openNew = this.settings.openInNewTab === true;
    const leaf = openNew
      ? this.app.workspace.getLeaf("tab")
      : this.app.workspace.getMostRecentLeaf() ?? this.app.workspace.getLeaf(false);

    await leaf.setViewState({ type: VIEW_TYPE_PYOINK, active: true });
    this.app.workspace.setActiveLeaf(leaf, { focus: true });
    const view = leaf.view;
    if (view instanceof PyoInkView) {
      await view.openFile(file);
      if (!this.settings.seenWelcomeTip) {
        this.settings.seenWelcomeTip = true;
        await this.saveSettings();
        new Notice(
          "PyoInk: draw with Pencil · finger pans · toolbar for tools/size · Exit saves",
          6000,
        );
      }
    }
  }

  async loadSettings() {
    this.settings = sanitizeSettings(await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

/** Settings: gestures + storage. Color/width stay on the floating toolbar. */
class PyoInkSettingTab extends PluginSettingTab {
  constructor(private plugin: PyoInkPlugin) {
    super(plugin.app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PyoInk" });
    containerEl.createEl("p", {
      text: "Floating toolbar: pen tools, colors, size. Below: what each tap does.",
    });

    // ——— Input channels ———
    containerEl.createEl("h3", { text: "Pen vs finger" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Apple Pencil = pointerType pen. Finger = touch. Strict mode keeps them on separate channels.",
    });

    new Setting(containerEl)
      .setName("Strict pen / finger separate")
      .setDesc(
        "ON (recommended): Pencil only draws; finger only pans/zooms/gestures. Never mix channels.",
      )
      .addToggle((t) =>
        t.setValue(this.plugin.settings.strictPenTouchSeparate !== false).onChange(async (v) => {
          this.plugin.settings.strictPenTouchSeparate = v;
          if (v) {
            this.plugin.settings.penOnlyInk = true;
            this.plugin.settings.allowFingerDraw = false;
          }
          this.plugin.settings = sanitizeSettings(this.plugin.settings);
          await this.plugin.saveSettings();
          this.display();
        }),
      );

    new Setting(containerEl)
      .setName("Pen-only ink")
      .setDesc("Finger never draws (forced ON when strict separate is ON).")
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.penOnlyInk !== false)
          .setDisabled(this.plugin.settings.strictPenTouchSeparate !== false)
          .onChange(async (v) => {
            this.plugin.settings.penOnlyInk = v;
            if (v) this.plugin.settings.allowFingerDraw = false;
            this.plugin.settings = sanitizeSettings(this.plugin.settings);
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    // ——— Stroke feel ———
    containerEl.createEl("h3", { text: "Stroke stabilisation" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Higher values feel more like GoodNotes (smoother, slightly laggy). Lower = more raw / responsive.",
    });
    new Setting(containerEl)
      .setName("Input streamline")
      .setDesc("Averages pointer samples while you draw (main stabiliser).")
      .addSlider((s) =>
        s
          .setLimits(0.2, 0.92, 0.02)
          .setValue(this.plugin.settings.pfStreamline ?? 0.72)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.pfStreamline = v;
            this.plugin.settings = sanitizeSettings(this.plugin.settings);
            await this.plugin.saveSettings();
            this.plugin.getActiveInkView()?.refreshStrokeSettings();
          }),
      );
    new Setting(containerEl)
      .setName("Outline smoothing")
      .setDesc("Smooths the rendered stroke edge after points are collected.")
      .addSlider((s) =>
        s
          .setLimits(0.2, 0.9, 0.02)
          .setValue(this.plugin.settings.pfSmoothing ?? 0.68)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.pfSmoothing = v;
            this.plugin.settings = sanitizeSettings(this.plugin.settings);
            await this.plugin.saveSettings();
            this.plugin.getActiveInkView()?.refreshStrokeSettings();
          }),
      );

    // ——— Zoom ———
    containerEl.createEl("h3", { text: "Zoom" });
    new Setting(containerEl)
      .setName("Pinch zoom")
      .setDesc("Two-finger pinch on the note (and Ctrl/⌘ + scroll wheel on desktop).")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.enablePinchZoom !== false).onChange(async (v) => {
          this.plugin.settings.enablePinchZoom = v;
          await this.plugin.saveSettings();
        }),
      );
    new Setting(containerEl)
      .setName("Min zoom")
      .setDesc("Smallest scale (0.5 = 50%).")
      .addSlider((s) =>
        s
          .setLimits(0.25, 1, 0.05)
          .setValue(this.plugin.settings.minZoom ?? 0.5)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.minZoom = v;
            this.plugin.settings = sanitizeSettings(this.plugin.settings);
            await this.plugin.saveSettings();
          }),
      );
    new Setting(containerEl)
      .setName("Max zoom")
      .setDesc("Largest scale (3 = 300%).")
      .addSlider((s) =>
        s
          .setLimits(1, 5, 0.1)
          .setValue(this.plugin.settings.maxZoom ?? 3)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.maxZoom = v;
            this.plugin.settings = sanitizeSettings(this.plugin.settings);
            await this.plugin.saveSettings();
          }),
      );

    // ——— Apple Pencil ———
    containerEl.createEl("h3", { text: "Apple Pencil (tip taps)" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Works with tip taps on the note inside Obsidian. iPadOS barrel/side double-tap is not sent to plugins.",
    });

    this.pencilSingleDropdown(
      containerEl,
      "Pencil tip single tap",
      "Short tip tap (almost no drag). Default: draw. Other choices run a shortcut instead of leaving a mark.",
      this.plugin.settings.pencilSingleTapAction || "ink",
    );

    new Setting(containerEl)
      .setName("Enable Pencil tip double-tap (~220ms window; off = zero delay handwriting)")
      .setDesc("Two quick tip taps → double-tap action below.")
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.enablePencilDoubleTap === true)
          .onChange(async (v) => {
            this.plugin.settings.enablePencilDoubleTap = v;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    this.actionDropdown(
      containerEl,
      "Pencil tip double-tap action",
      "What two quick tip taps do (default: cycle pen / marker / eraser).",
      "pencilDoubleTapAction",
      this.plugin.settings.pencilDoubleTapAction || "cycle_tool",
      this.plugin.settings.enablePencilDoubleTap !== true,
    );

    // ——— Finger ———
    containerEl.createEl("h3", { text: "Finger taps" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Finger only (not Pencil). Scrolling still works when you drag.",
    });

    this.actionDropdown(
      containerEl,
      "Two-finger tap",
      "Short two-finger tap.",
      "twoFingerTapAction",
      this.plugin.settings.twoFingerTapAction,
    );
    this.actionDropdown(
      containerEl,
      "Three-finger tap",
      "Short three-finger tap.",
      "threeFingerTapAction",
      this.plugin.settings.threeFingerTapAction,
    );
    this.actionDropdown(
      containerEl,
      "Finger double-tap",
      "Two quick taps with one finger.",
      "doubleTapAction",
      this.plugin.settings.doubleTapAction,
    );

    // ——— Workspace ———
    containerEl.createEl("h3", { text: "Workspace" });
    new Setting(containerEl)
      .setName("Open in new tab")
      .setDesc(
        "OFF (default): replace the current tab with PyoInk. ON: open PyoInk in a new tab.",
      )
      .addToggle((t) =>
        t.setValue(this.plugin.settings.openInNewTab === true).onChange(async (v) => {
          this.plugin.settings.openInNewTab = v;
          await this.plugin.saveSettings();
        }),
      );

    // ——— Storage ———
    containerEl.createEl("h3", { text: "Storage" });

    new Setting(containerEl)
      .setName("Annotations folder")
      .setDesc("Where .pyoink.json files are stored (not under .obsidian).")
      .addText((t) =>
        t.setValue(this.plugin.settings.annotationsFolder).onChange(async (v) => {
          this.plugin.settings = sanitizeSettings({
            ...this.plugin.settings,
            annotationsFolder: v,
          });
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Idle auto-save")
      .setDesc("Save after idle. Always saves when you leave ink view.")
      .addDropdown((d) => {
        d.addOption("12", "12 seconds");
        d.addOption("20", "20 seconds");
        d.addOption("30", "30 seconds");
        const cur = String(Math.round((this.plugin.settings.debounceMs || 12000) / 1000));
        d.setValue(["12", "20", "30"].includes(cur) ? cur : "12");
        d.onChange(async (v) => {
          this.plugin.settings.debounceMs = Number(v) * 1000;
          await this.plugin.saveSettings();
        });
      });
  }

  private pencilSingleDropdown(
    containerEl: HTMLElement,
    name: string,
    desc: string,
    value: PencilSingleTapAction,
  ) {
    new Setting(containerEl)
      .setName(name)
      .setDesc(desc)
      .addDropdown((d) => {
        for (const [id, label] of Object.entries(PENCIL_SINGLE_TAP_LABELS)) {
          d.addOption(id, label);
        }
        d.setValue(value);
        d.onChange(async (v) => {
          this.plugin.settings.pencilSingleTapAction = v as PencilSingleTapAction;
          await this.plugin.saveSettings();
        });
      });
  }

  private actionDropdown(
    containerEl: HTMLElement,
    name: string,
    desc: string,
    key:
      | "twoFingerTapAction"
      | "threeFingerTapAction"
      | "doubleTapAction"
      | "pencilDoubleTapAction",
    value: FingerAction,
    disabled = false,
  ) {
    const setting = new Setting(containerEl).setName(name).setDesc(desc);
    setting.addDropdown((d) => {
      for (const [id, label] of Object.entries(FINGER_ACTION_LABELS)) {
        d.addOption(id, label);
      }
      d.setValue(value);
      d.setDisabled(disabled);
      d.onChange(async (v) => {
        this.plugin.settings[key] = v as FingerAction;
        if (key === "twoFingerTapAction") {
          this.plugin.settings.enableTwoFingerToolCycle = v !== "none";
        }
        await this.plugin.saveSettings();
      });
    });
  }
}
