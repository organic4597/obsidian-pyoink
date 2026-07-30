# GestureRouter state (0.3.3)

## Channels
- **pen** (`pointerType=pen`, `buttons>0`): ink / erase only
- **touch**: pan, pinch zoom, finger shortcuts (never ink when strict/penOnly)
- **mouse**: ink when not navigate; navigate-click only in navigate mode

## Draw lock
- `activeDrawId` + `activeDrawType` while stroking
- `penDownIds` only while tip contact (`buttons>0`)
- `beginPen`/`beginErase` always end prior session first

## Palm
- Touch blocked only while `penDownIds` non-empty (not post-pen window for scroll)

## Pinch
- Two fingers → scale; `lastPinchAt` suppresses multi-finger tap for 450ms

## Tip double-tap
- Off by default; enable only when `enablePencilDoubleTap === true`
- Near-stationary poke only (<12px, <200ms)
