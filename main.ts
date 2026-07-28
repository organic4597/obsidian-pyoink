import { Notice, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";
import { PyoInkView, VIEW_TYPE_PYOINK } from "./src/view/PyoInkView";
import {
  DEFAULT_SETTINGS,
  FINGER_ACTION_LABELS,
  sanitizeSettings,
  type FingerAction,
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

class PyoInkSettingTab extends PluginSettingTab {
  constructor(private plugin: PyoInkPlugin) {
    super(plugin.app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PyoInk" });
    containerEl.createEl("p", {
      text: "Transparent ink on Markdown. Pen draws; finger gestures are shortcuts. Auto-save after 12s idle or on leave.",
    });

    new Setting(containerEl)
      .setName("Pen-only ink")
      .setDesc("Only Apple Pencil draws. Finger = scroll / shortcuts.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.penOnlyInk !== false).onChange(async (v) => {
          this.plugin.settings.penOnlyInk = v;
          if (v) this.plugin.settings.allowFingerDraw = false;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Idle save delay (ms)")
      .setDesc("Default 12000 (12s) with no writing. Always saves when leaving.")
      .addSlider((s) =>
        s
          .setLimits(12000, 30000, 1000)
          .setValue(this.plugin.settings.debounceMs)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.debounceMs = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Undo / Redo stack size")
      .setDesc("Queue depth (max 50). Oldest dropped when full.")
      .addSlider((s) =>
        s
          .setLimits(10, 50, 1)
          .setValue(this.plugin.settings.undoLimit)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.undoLimit = v;
            await this.plugin.saveSettings();
          }),
      );

    containerEl.createEl("h3", { text: "Finger shortcuts" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Assign actions to finger taps (not pencil). Short taps only; move = scroll.",
    });

    this.fingerDropdown(
      containerEl,
      "Two-finger tap",
      "twoFingerTapAction",
      this.plugin.settings.twoFingerTapAction,
    );
    this.fingerDropdown(
      containerEl,
      "Three-finger tap",
      "threeFingerTapAction",
      this.plugin.settings.threeFingerTapAction,
    );
    this.fingerDropdown(
      containerEl,
      "Double-tap (one finger)",
      "doubleTapAction",
      this.plugin.settings.doubleTapAction,
    );

    new Setting(containerEl)
      .setName("Annotations folder")
      .addText((t) =>
        t.setValue(this.plugin.settings.annotationsFolder).onChange(async (v) => {
          this.plugin.settings = sanitizeSettings({
            ...this.plugin.settings,
            annotationsFolder: v,
          });
          await this.plugin.saveSettings();
        }),
      );
  }

  private fingerDropdown(
    containerEl: HTMLElement,
    name: string,
    key: "twoFingerTapAction" | "threeFingerTapAction" | "doubleTapAction",
    value: FingerAction,
  ) {
    new Setting(containerEl).setName(name).addDropdown((d) => {
      for (const [id, label] of Object.entries(FINGER_ACTION_LABELS)) {
        d.addOption(id, label);
      }
      d.setValue(value);
      d.onChange(async (v) => {
        this.plugin.settings[key] = v as FingerAction;
        // keep legacy flag in sync
        if (key === "twoFingerTapAction") {
          this.plugin.settings.enableTwoFingerToolCycle = v !== "none";
        }
        await this.plugin.saveSettings();
      });
    });
  }
}
