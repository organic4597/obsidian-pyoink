import type { App, TFile } from "obsidian";
import { Notice, TFolder } from "obsidian";
import {
  annotationRelPath,
  emptyDoc,
  parseInkJson,
  serializeInkDoc,
  type InkDocV1,
  type LoadResult,
} from "./schema";
import { inkLog } from "../util/errors";
import type { PyoInkSettings } from "../util/settings";

export class InkStore {
  private saving = false;
  private pending = false;
  private loadedMtime = 0;

  constructor(
    private app: App,
    private settings: () => PyoInkSettings,
  ) {}

  pathFor(sourcePath: string): string {
    return annotationRelPath(this.settings().annotationsFolder, sourcePath);
  }

  getLoadedMtime(): number {
    return this.loadedMtime;
  }

  async ensureFolder(): Promise<boolean> {
    const folder = this.settings().annotationsFolder.replace(/\/+$/, "");
    const abs = this.app.vault.getAbstractFileByPath(folder);
    if (abs && !(abs instanceof TFolder)) {
      inkLog("E_STORE_FOLDER", folder);
      new Notice("PyoInk: annotations folder is a file — check settings");
      return false;
    }
    if (!abs) {
      try {
        await this.app.vault.createFolder(folder);
      } catch (e) {
        // race: already exists
        const again = this.app.vault.getAbstractFileByPath(folder);
        if (!(again instanceof TFolder)) {
          inkLog("E_STORE_FOLDER", e);
          new Notice("PyoInk: cannot create annotations folder");
          return false;
        }
      }
    }
    return true;
  }

  async load(sourcePath: string): Promise<LoadResult> {
    const path = this.pathFor(sourcePath);
    // legacy hermes-ink .hink.json
    const legacyPath = path.replace(/\.pyoink\.json$/i, ".hink.json");
    let af = this.app.vault.getAbstractFileByPath(path);
    if (!af) af = this.app.vault.getAbstractFileByPath(legacyPath);
    if (!af || !("extension" in af)) {
      this.loadedMtime = 0;
      return { ok: true, doc: emptyDoc(sourcePath), warnings: [] };
    }
    const file = af as TFile;
    const loadedFromLegacy = file.path !== path;
    try {
      const text = await this.app.vault.read(file);
      const result = parseInkJson(text, sourcePath);
      this.loadedMtime = file.stat.mtime;
      if (result.ok === false) {
        const code = result.code;
        try {
          const bak = `${file.path}.corrupt-${Date.now()}`;
          await this.app.vault.adapter.write(bak, text);
          new Notice(`PyoInk: bad ink file (backed up). Starting empty.`);
        } catch {
          new Notice(`PyoInk: bad ink file (${code}). Starting empty.`);
        }
      } else if (result.warnings.includes("E_SOURCE_MISMATCH")) {
        new Notice("PyoInk: ink file source path mismatch — check carefully");
      } else if (loadedFromLegacy && result.ok) {
        // migrate to .pyoink.json on next save
        result.warnings.push("E_LEGACY_PATH");
      }
      return result;
    } catch (e) {
      inkLog("E_READ", e);
      new Notice("PyoInk: failed to read ink file");
      return { ok: false, code: "E_READ", doc: emptyDoc(sourcePath), warnings: ["E_READ"] };
    }
  }

  /**
   * Atomic-ish write: tmp then rename/replace.
   * Never modifies source markdown.
   */
  async save(doc: InkDocV1): Promise<boolean> {
    if (this.saving) {
      this.pending = true;
      return true;
    }
    this.saving = true;
    let ok = false;
    try {
      if (!(await this.ensureFolder())) {
        ok = false;
      } else {
        const path = this.pathFor(doc.source);
        const body = serializeInkDoc(doc);
        const tmp = `${path}.tmp`;
        try {
          await this.app.vault.adapter.write(tmp, body);
          // prefer rename
          try {
            if (await this.app.vault.adapter.exists(path)) {
              await this.app.vault.adapter.remove(path);
            }
            // some adapters lack rename — write final
            await this.app.vault.adapter.write(path, body);
            try {
              await this.app.vault.adapter.remove(tmp);
            } catch {
              /* ignore */
            }
          } catch {
            await this.app.vault.adapter.write(path, body);
          }
          const af = this.app.vault.getAbstractFileByPath(path);
          if (af && "stat" in af) this.loadedMtime = (af as TFile).stat.mtime;
          ok = true;
        } catch (e) {
          inkLog("E_SAVE", e);
          new Notice("PyoInk: save failed — strokes kept in memory");
          ok = false;
          try {
            await this.app.vault.adapter.remove(tmp);
          } catch {
            /* ignore */
          }
        }
      }
    } finally {
      this.saving = false;
      if (this.pending) {
        this.pending = false;
        // caller should re-invoke with latest doc
      }
    }
    return ok;
  }

  consumePending(): boolean {
    if (!this.pending) return false;
    this.pending = false;
    return true;
  }

  isSaving(): boolean {
    return this.saving;
  }
}
