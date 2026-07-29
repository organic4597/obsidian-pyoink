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

export default class PyoInkPlugin extends Plugin {
  settings: PyoInkSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(VIEW_TYPE_PYOINK, (leaf) => new PyoInkView(leaf, this));

    this.addCommand({
      id: "open-pyoink-current",
      name: "Open PyoInk on current note",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (!checking) void this.openInk(file);
        return true;
      },
    });

    this.addRibbonIcon("pen-tool", "PyoInk", async () => {
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== "md") {
        new Notice("Open a Markdown note first");
        return;
      }
      await this.openInk(file);
    });

    this.addSettingTab(new PyoInkSettingTab(this));
  }

  getActiveInkView(): PyoInkView | null {
    for (const l of this.app.workspace.getLeavesOfType(VIEW_TYPE_PYOINK)) {
      if (l.view instanceof PyoInkView) return l.view;
    }
    return null;
  }

  async openInk(file: TFile) {
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE_PYOINK, active: true });
    const view = leaf.view;
    if (view instanceof PyoInkView) await view.openFile(file);
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
      .setName("Enable Pencil tip double-tap")
      .setDesc("Two quick tip taps → double-tap action below.")
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.enablePencilDoubleTap !== false)
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
      !this.plugin.settings.enablePencilDoubleTap,
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
