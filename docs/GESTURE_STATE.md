# GestureRouter state (0.6.1)

## Channels
- **pen** (`pointerType=pen`, tip contact): ink / erase only
- **touch**: pan, pinch zoom, finger shortcuts (never ink when `strictPenTouchSeparate` / pen-only)
- **mouse**: ink when not navigate; navigate-click only in navigate mode

## Draw session (0.6.x)
- Simple canvas path: `pointerdown → move → up`
- Stroke ends only on **real tip-up** (character writing / multi-stroke Hangul)
- Prior draw session always ended before a new `beginPen` / `beginErase`

## Palm
- Touch-as-ink blocked briefly after pen lift (`palmRejectMs`, default 50ms) — does **not** delay Pencil re-down
- Finger/palm **pan** blocked while writing and for `writingPalmGuardMs` (default 2000ms) after Pencil activity so Hangul tip-lifts don’t steal pan

## Pinch
- Two fingers → scale; multi-finger tap suppressed briefly after pinch

## Tip double-tap
- **Off by default** (`enablePencilDoubleTap === false`)
- When enabled: near-stationary tip poke only (~220ms window)
- Barrel/side Pencil double-tap is OS-level and **not** delivered to Obsidian plugins

## Defaults (handwriting-first)
- `penOnlyInk: true`
- `strictPenTouchSeparate: true`
- `allowFingerDraw: false`
- `enablePencilDoubleTap: false`
- `pencilSingleTapAction: ink`
