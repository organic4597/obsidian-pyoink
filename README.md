# PyoInk

**Transparent handwriting on Markdown, PDFs, and images** in [Obsidian](https://obsidian.md).

Draw with **Apple Pencil** (or a mouse on desktop) without changing the source file. Strokes live in JSON sidecars so LiveSync, git, and plain-text workflows stay clean.

[![version](https://img.shields.io/badge/version-0.6.1-blue)](https://github.com/organic4597/obsidian-pyoink/releases)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![obsidian](https://img.shields.io/badge/Obsidian-1.5%2B-7c3aed)](https://obsidian.md)

---

## Why PyoInk?

| Need | PyoInk |
|------|--------|
| Annotate notes without polluting `.md` | ✅ sidecar JSON only |
| iPad Pencil + palm rejection | ✅ pen / touch channels separated |
| Hangul & multi-stroke characters | ✅ tip-up splits strokes correctly (0.6.x) |
| PDF / image markup | ✅ same ink canvas |
| LiveSync / Obsidian Sync friendly | ✅ source files untouched |

---

## Features (0.6.1)

### Ink & media
- **Markdown, PDF, and image ink** — notes, scans, screenshots
- **Reading-view layout** — Obsidian preview classes/theme (headings, lists, callouts, embeds)
- **Hybrid layout fidelity** — CSS variables & type metrics from a live Markdown leaf when available
- **Stable centered column** — no mid-write horizontal jump
- **Pen / highlighter / eraser** with perfect-freehand outlines (MIT)

### Pencil & touch (iPad-first)
- **Pen-only ink by default** — finger pans & pinch-zooms; palm ignored while stylus is active
- **Strict pen/touch separate channels** (recommended on iPad)
- **Character writing (0.6.1)** — strokes split only on real tip-up (Hangul ㅁ/ㅣ and multi-stroke glyphs)
- **Fast re-down** after lift — low lag between strokes
- **Writing palm guard** — blocks accidental pan during brief tip lifts
- Optional **Pencil tip double-tap** (off by default; ~220ms window when enabled)
- Barrel/side Pencil double-tap is **not** available to Obsidian plugins — use tip gestures or toolbar

### UI & navigation
- Floating **tool island** + **style rail** (color, 7-step size, RGB)
- Pinch zoom + Ctrl/⌘ + wheel (desktop)
- Finger shortcuts: 2-finger / 3-finger / double-tap (configurable)
- Undo / redo (history depth configurable, max 50)
- **Navigate mode** for links under ink
- Opens in the **current tab** by default (optional new tab)
- File explorer: **Open with PyoInk**
- Ribbon pen icon + command palette

### Storage
- Non-destructive: `PyoInk/<note-path>.pyoink.json`
- Idle auto-save (default **12s**) + always save on leave
- No network, no analytics — data stays in your vault

---

## Install

### BRAT (recommended while in beta)

1. Install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat)
2. **Add beta plugin** → `https://github.com/organic4597/obsidian-pyoink`
3. Enable **PyoInk** → reload Obsidian

### Manual

1. Download the latest [release](https://github.com/organic4597/obsidian-pyoink/releases) assets  
   (`main.js`, `manifest.json`, `styles.css`)
2. Copy into:

```text
<vault>/.obsidian/plugins/pyoink/
```

3. Enable the plugin and reload Obsidian

### Community plugins

After directory approval: **Settings → Community plugins → Browse → PyoInk**

---

## Quick start

1. Open a **Markdown**, **PDF**, or **image** file  
2. Command palette → **Open PyoInk on current file**  
   (or ribbon pen / right-click → Open with PyoInk)  
3. Draw with Apple Pencil — finger scrolls / pinch-zooms  
4. Toolbar: tools, colors, size (− / slider / +)  
5. **Nav** to click links · **Exit** saves and returns  

Ink never rewrites the source `.md` / `.pdf` / image.

### PDF notes
- Pages via Obsidian’s built-in pdf.js (**first 40 pages** per open)
- One continuous canvas over stacked pages

---

## Settings (summary)

| Area | Defaults / notes |
|------|------------------|
| Pen vs finger | Strict separate channels · pen-only ink |
| Workspace | Current tab (default) or new tab |
| Pencil tip | Single-tap = draw · tip double-tap **off** |
| Finger taps | 2-finger cycle tool · 3-finger undo · double-tap nav |
| Zoom | Pinch 0.5×–3× |
| Storage | Folder `PyoInk/` · idle save 12s |
| Palm | Short palm-reject after lift · writing guard ~2s |

---

## What’s new

### 0.6.1
- **Character writing fix** — split strokes on real tip-up only (multi-stroke Hangul/glyphs no longer merge or cut wrongly)

### 0.6.0
- Pencil path rewrite — simple canvas `down / move / up` for reliable tip contact

### 0.5.x (highlights)
- Hybrid reading layout + ink on **PDF and images**
- Hangul multi-stroke & short jamo (ㅣ) reliability
- Block text selection / palm pan while inking
- Chrome UI remaster (glass / a11y)
- Pinch zoom label + stronger stroke stabilise

Full history: [CHANGELOG.md](CHANGELOG.md)

---

## Limitations

- Dedicated ink view (not Live Preview + ink in the same leaf)
- iPadOS **barrel/side** Pencil double-tap is not delivered to plugins
- Complex third-party embeds may differ from core reading view
- Very large PDFs: first **40** pages in ink view
- PDF reflow on big resizes: re-open to rebuild page bitmaps

---

## Privacy

- No network requests  
- No analytics  
- All ink data stays in your vault  

---

## Development

```bash
npm install
npm run build    # → main.js
```

Requires Obsidian **1.5.0+**. `isDesktopOnly: false` (mobile + desktop).

---

## License

MIT. Includes [perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT) by Steve Ruiz.

---

## Links

- Repo: https://github.com/organic4597/obsidian-pyoink  
- Issues: https://github.com/organic4597/obsidian-pyoink/issues  
- Releases: https://github.com/organic4597/obsidian-pyoink/releases  
