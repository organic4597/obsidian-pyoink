import { Notice, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";
import { PyoInkView, VIEW_TYPE_PYOINK } from "./src/view/PyoInkView";
import { DEFAULT_SETTINGS, sanitizeSettings, type PyoInkSettings } from "./src/util/settings";

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
      text: "Transparent ink on Markdown. Pen-only by default. Saves only after idle / exit (not every stroke).",
    });

    new Setting(containerEl)
      .setName("Pen-only ink")
      .setDesc("Only Apple Pencil draws. Finger scrolls.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.penOnlyInk !== false).onChange(async (v) => {
          this.plugin.settings.penOnlyInk = v;
          if (v) this.plugin.settings.allowFingerDraw = false;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Idle save delay (ms)")
      .setDesc("Higher = less lag while writing. Always saves on exit.")
      .addSlider((s) =>
        s
          .setLimits(2000, 20000, 500)
          .setValue(this.plugin.settings.debounceMs)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.debounceMs = v;
            await this.plugin.saveSettings();
          }),
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
}
