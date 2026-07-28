# PyoInk

Transparent handwriting layer on top of Markdown notes in Obsidian.

Draw with Apple Pencil (or a mouse on desktop) without modifying the note file. Strokes are stored as separate JSON sidecars so LiveSync and plain-text workflows stay clean.

## Features

- **Transparent ink overlay** on rendered Markdown (pen / highlighter / eraser)
- **Pen-only ink by default** — finger scrolls; palm is ignored while the stylus is active
- **perfect-freehand** stroke rendering (MIT)
- Non-destructive storage: `PyoInk/<note-path>.pyoink.json`
- Tool cycle (toolbar / two-finger tap), undo/redo, layout drift badge
- Navigate mode for links under the ink layer

## Install

### Community plugins (after approval)

Settings → Community plugins → Browse → search **PyoInk**.

### BRAT (beta / before community approval)

1. Install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat)
2. Add beta plugin → this repository URL
3. Enable **PyoInk** and reload

### Manual

Copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/pyoink/
```

Enable the plugin and reload Obsidian.

## Usage

1. Open a Markdown note
2. Command palette → **Open PyoInk on current note** (or the ribbon pen icon)
3. Draw with Apple Pencil
4. **Nav** (or `N`) to click links; **Cycle** / two-finger tap to switch tools
5. Exit saves ink automatically

Ink data lives under `PyoInk/` and does **not** alter the source `.md` file.

## Settings

| Setting | Default | Notes |
|---------|---------|--------|
| Pen-only ink | ON | Finger never draws |
| Annotations folder | `PyoInk` | Vault-relative |
| Two-finger tool cycle | ON | |
| Pencil double-tap probe | OFF | Often unavailable on iPad WebView |

## Privacy

- No network requests
- No analytics
- All data stays in your vault

## License

MIT. Includes [perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT).

## Credits

- Stroke outlines: [perfect-freehand](https://github.com/steveruizok/perfect-freehand) by Steve Ruiz
