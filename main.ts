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

    this.addCommand({
      id: "pyoink-cycle-tool",
      name: "PyoInk: cycle tool",
      callback: () => {
        const v = this.getActiveInkView();
        if (v) v.cycleTool();
        else new Notice("Open PyoInk view first");
      },
    });

    this.addCommand({
      id: "pyoink-force-save",
      name: "PyoInk: force save",
      callback: () => {
        const v = this.getActiveInkView();
        if (v) void v.flushSave();
        else new Notice("Open PyoInk view first");
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
      text: "GoodNotes-feel overlay on Markdown. Source notes are never modified. Pencil double-tap is best-effort (often unavailable on iPad WebView).",
    });

    new Setting(containerEl)
      .setName("Annotations folder")
      .setDesc("Vault-relative. LiveSync-friendly. Not under .obsidian/plugins.")
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
      .setName("Two-finger tap cycles tool")
      .setDesc("On the transparent ink layer: short two-finger tap cycles Pen/Hi/Eraser.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.enableTwoFingerToolCycle).onChange(async (v) => {
          this.plugin.settings.enableTwoFingerToolCycle = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Probe Pencil double-tap (experimental)")
      .setDesc("Often unavailable in Obsidian iPad WebView. Prefer Cycle / two-finger / N=Nav.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.enablePencilDoubleTapProbe).onChange(async (v) => {
          this.plugin.settings.enablePencilDoubleTapProbe = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Pen-only ink (recommended)")
      .setDesc(
        "ON: only Apple Pencil / stylus draws. Finger/hand never inks — scroll or two-finger Cycle only. While pen is down, palm is ignored.",
      )
      .addToggle((t) =>
        t.setValue(this.plugin.settings.penOnlyInk !== false).onChange(async (v) => {
          this.plugin.settings.penOnlyInk = v;
          if (v) this.plugin.settings.allowFingerDraw = false;
          await this.plugin.saveSettings();
          this.display();
        }),
      );

    new Setting(containerEl)
      .setName("Allow finger draw")
      .setDesc("Only if Pen-only ink is OFF. Still blocked while Pencil was recently used (palm).")
      .addToggle((t) =>
        t
          .setValue(this.plugin.settings.allowFingerDraw)
          .setDisabled(this.plugin.settings.penOnlyInk !== false)
          .onChange(async (v) => {
            this.plugin.settings.allowFingerDraw = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Palm reject after pen (ms)")
      .setDesc("After Pencil lifts, ignore hand as ink for this long.")
      .addSlider((s) =>
        s
          .setLimits(0, 2000, 50)
          .setValue(this.plugin.settings.palmRejectMs ?? 700)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.palmRejectMs = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Pen color")
      .addText((t) =>
        t.setValue(this.plugin.settings.penColor).onChange(async (v) => {
          this.plugin.settings.penColor = v || "#1a1a1a";
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Highlighter color")
      .addText((t) =>
        t.setValue(this.plugin.settings.highlighterColor).onChange(async (v) => {
          this.plugin.settings.highlighterColor = v || "#ffe566";
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Pressure gain")
      .addSlider((s) =>
        s
          .setLimits(0.3, 3, 0.05)
          .setValue(this.plugin.settings.pressureGain)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.pressureGain = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("perfect-freehand smoothing")
      .addSlider((s) =>
        s
          .setLimits(0, 0.9, 0.05)
          .setValue(this.plugin.settings.pfSmoothing)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.pfSmoothing = v;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Pen width")
      .addSlider((s) =>
        s
          .setLimits(0.5, 20, 0.1)
          .setValue(this.plugin.settings.penWidth)
          .setDynamicTooltip()
          .onChange(async (v) => {
            this.plugin.settings.penWidth = v;
            await this.plugin.saveSettings();
          }),
      );
  }
}
