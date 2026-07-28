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

/** Settings UI: no pen/color/width — those are in-session on the floating toolbar. */
class PyoInkSettingTab extends PluginSettingTab {
  constructor(private plugin: PyoInkPlugin) {
    super(plugin.app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PyoInk" });
    containerEl.createEl("p", {
      text: "Pen color, width, and tools are set on the floating toolbar while writing. Only shortcuts & storage here.",
    });

    containerEl.createEl("h3", { text: "Finger shortcuts" });
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Short finger taps (not Pencil). Drag/move still scrolls.",
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
      .setDesc("Save after this many seconds with no writing. Always saves when you leave.")
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
        if (key === "twoFingerTapAction") {
          this.plugin.settings.enableTwoFingerToolCycle = v !== "none";
        }
        await this.plugin.saveSettings();
      });
    });
  }
}
