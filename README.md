# PyoInk

Transparent handwriting layer on top of **Markdown notes, PDFs, and images** in Obsidian.

Draw with Apple Pencil (or a mouse on desktop) without modifying the source file. Strokes live in separate JSON sidecars so LiveSync and plain-text workflows stay clean.

## Features

- **Markdown, PDF, and image ink** — annotate notes, scans, and pictures
- **Reading-view layout** — Markdown rendered with Obsidian preview classes/theme (headings, lists, callouts, embeds)
- **Hybrid layout fidelity** — CSS variables and type metrics copied from a live Markdown leaf when available
- **Stable column** — readable line width centered; no mid-write left jump
- **Transparent ink overlay** — pen / highlighter / eraser
- **Pen-only ink by default** — finger pans/zooms; palm ignored while the stylus is active
- **perfect-freehand** stroke rendering (MIT)
- Non-destructive storage: `PyoInk/<path>.pyoink.json`
- Floating tool island + style rail (color, 7-step size, RGB)
- Pinch zoom (and Ctrl/⌘ + wheel on desktop)
- Finger shortcuts (2/3-finger tap, double-tap) — configurable in settings
- Optional Pencil **tip** double-tap (off by default; barrel double-tap is not available in Obsidian)
- Undo/redo, navigate mode for links under ink
- Opens in the **current tab** by default (optional new tab)
- File explorer context menu: **Open with PyoInk**

## Install

### Community plugins (after approval)

Settings → Community plugins → Browse → search **PyoInk**.

### BRAT (beta)

1. Install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat)
2. Add beta plugin → `https://github.com/organic4597/obsidian-pyoink`
3. Enable **PyoInk** and reload

### Manual

Copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/pyoink/
```

Enable the plugin and reload Obsidian.

## Usage

1. Open a **Markdown**, **PDF**, or **image** (png/jpg/webp/gif/…) file
2. Command palette → **Open PyoInk on current file** (or the ribbon pen icon, or right‑click → Open with PyoInk)
3. Draw with Apple Pencil (finger scrolls / pinch-zooms)
4. Toolbar: tools, colors, size (− / slider / +)
5. **Nav** to click links (Markdown); **Exit** saves and returns to the file

Ink data lives under `PyoInk/` and does **not** alter the source `.md` / `.pdf` / image.

### PDF notes

- Pages render via Obsidian’s built-in pdf.js (first **40** pages max per open)
- Ink is one continuous canvas over the stacked pages (same coordinate system as Markdown)

## Settings (summary)

| Area | Notes |
|------|--------|
| Pen vs finger | Strict separate channels (recommended on iPad) |
| Workspace | Open in current tab (default) or new tab |
| Pencil tip taps | Single-tap action (default: draw); optional tip double-tap |
| Finger taps | 2-finger / 3-finger / double-tap actions |
| Zoom | Pinch min/max |
| Storage | Annotations folder, idle auto-save |

## Limitations

- Opens a dedicated ink view (not Live Preview editing + ink in the same leaf)
- iPadOS **barrel/side** Pencil double-tap is not delivered to plugins — use tip gestures or the toolbar
- Complex third-party embed plugins may not render identically to core reading view
- Very large PDFs only show the first 40 pages in ink view
- PDF re-render on window resize uses the width at open time (re-open to reflow page bitmaps)

## Privacy

- No network requests
- No analytics
- All data stays in your vault

## License

MIT. Includes [perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT).

## Credits

- Stroke outlines: [perfect-freehand](https://github.com/steveruizok/perfect-freehand) by Steve Ruiz
