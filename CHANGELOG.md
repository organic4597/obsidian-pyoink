# Changelog

All notable changes to **PyoInk** are documented here.

## 0.6.1 — 2026-07-30

### Fixed
- **Character writing**: strokes split only on real tip-up so multi-stroke Hangul (e.g. ㅁ) and glyphs no longer merge or cut mid-character

## 0.6.0 — 2026-07-30

### Changed
- Pencil input path rewritten to simple canvas `pointerdown / move / up` for reliable tip contact and hover

## 0.5.11

### Fixed
- Stop cutting strokes mid-glyph during continuous writing

## 0.5.10

### Fixed
- Restore Pencil hover + reliable tip contact detection

## 0.5.9

### Fixed
- Hangul multi-stroke (ㅁ) handling
- Hard-block palm pan while writing

## 0.5.8

### Fixed
- Block text selection / drag while Pencil is inking

## 0.5.7

### Fixed
- Short Hangul jamo (ㅣ) never rendered invisible

## 0.5.6

### Fixed
- Never drop fast Pencil strokes

## 0.5.5

### Fixed
- Zero wait on Pencil re-down; palmReject 50ms

## 0.5.4

### Fixed
- Palm pan must yield to Pencil — kill drag under active ink

## 0.5.3

### Fixed
- Cut Pencil lift → re-down lag (~3× snappier)

## 0.5.2

### Added
- Chrome UI remaster — taste / glass / a11y

## 0.5.1

### Fixed
- Pinch zoom, live zoom label, stronger stroke stabilise

## 0.5.0

### Added
- Hybrid reading layout
- Ink on **PDF** and **images** (in addition to Markdown)

## 0.4.x

### Added
- Community-ready entry UX, reading layout, docs
- Centered column layout; stop mid-write jump

## 0.3.x

### Added / fixed
- GestureRouter channels (pen / touch / mouse)
- Tip double-tap off by default; reliability audit P0–P2
- Zero stroke-to-stroke lag when tip double-tap disabled

## 0.2.x – 0.1.x

- Initial transparent ink overlay, sidecar storage, tool island, style rail
