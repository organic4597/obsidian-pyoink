import type { TFile } from "obsidian";

export type InkableKind = "markdown" | "image" | "pdf";

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]);

export function inkableKind(file: TFile | null | undefined): InkableKind | null {
  if (!file) return null;
  const ext = (file.extension || "").toLowerCase();
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "pdf") return "pdf";
  if (IMAGE_EXT.has(ext)) return "image";
  return null;
}

export function isInkableFile(file: TFile | null | undefined): boolean {
  return inkableKind(file) !== null;
}
