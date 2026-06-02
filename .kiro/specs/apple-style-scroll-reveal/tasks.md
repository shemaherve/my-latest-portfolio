# Implementation Plan: Apple-Style Scroll Reveal

## Overview

Transform the existing `StickyScrollCanvas` component into a premium Apple-style scroll-driven animation experience. The implementation builds incrementally: frame configuration and preloading first, then the canvas renderer with DPR support, then scroll-driven frame updates, then the text overlay system, and finally accessibility and error handling layers. All work is confined to `StickyScrollCanvas.tsx` and `globals.css`.

## Tasks

- [ ] 1. Establish frame configuration and constants
  - Replace any existing frame constants with the canonical `FRAME_NAMES` array (`"001"` through `"026"` with gaps, 20 entries total) and `TOTAL_FRAMES = 20`
  - Implement the pure `getFramePath(index: number): string` function returning `/sit/ezgif-frame-${FRAME_NAMES[index]}.jpg`
  - Add JSDoc comment to `getFramePath` explaining the index-to-filename mapping
  - Define internal TypeScript types: `FrameIndex` (number 0–19), `ScrollProgress` (number 0.0–1.0)
  - _Requirements: 9.3, 9.4, 9.2_

- [ ] 2. Implement the Frame Preloader System
  - [ ] 2.1 Write the preloader `useEffect` that creates `HTMLImageElement` objects for all 20 frames with `crossOrigin: "anonymous"`
    - Use a per-frame 10-second `setTimeout` timeout; on timeout log `⏱ Timeout loading frame ${i}` and call `checkComplete()`
    - On `img.onload` clear the timeout, log `✓ Loaded frame ${i+1}/${TOTAL_FRAMES}`, and call `checkComplete()`
    - On `img.onerror` clear the timeout, log `✗ Failed to load: ${getFramePath(i)}`, and call `checkComplete()`
    - When `loadedCount === TOTAL_FRAMES`, set `imagesRef.current`, call `setImagesLoaded(true)`, and schedule `drawFrame(0)` after 100ms
    - Return a cleanup function that sets `isMounted = false` and clears all pending timeouts
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 8.1, 8.2, 8.8_

  - [ ] 2.2 Add `loadError` state and canvas-context-unavailable detection
    - Introduce `const [loadError, setLoadError] = useState(false)` for tracking total failure
    - In `drawFrame`, if `canvas.getContext("2d")` returns null, call `setLoadError(true)` and return early
    - If all frames fail (tracked via a failed-count ref), call `setLoadError(true)`
    - _Requirements: 8.3, 8.5_

- [ ] 3. Implement the Canvas Renderer (`drawFrame`)
  - [ ] 3.1 Write the `drawFrame` `useCallback` with DPR-aware resolution and object-fit contain logic
    - Compute `dpr = window.devicePixelRatio || 1` and set `canvas.width = rect.width * dpr`, `canvas.height = rect.height * dpr`
    - Call `ctx.scale(dpr, dpr)` then fill background `#000000`
    - Guard against `img.naturalWidth === 0` with a `console.warn` and early return
    - Implement object-fit contain: compare `imgAspect` vs `canvasAspect`, compute `drawX/Y/Width/Height` to center the frame
    - Set `ctx.imageSmoothingEnabled = true` and `ctx.imageSmoothingQuality = "high"` before `ctx.drawImage`
    - Wrap the entire draw operation in a `try-catch`; on error log `Error rendering frame ${frameIndex}:` and the error
    - Add JSDoc comment describing parameters and behavior
    - _Requirements: 1.2, 1.7, 4.6, 4.7, 4.8, 8.4, 8.6, 8.7, 9.5_

  - [ ] 3.2 Add the resize handler `useEffect`
    - Listen to `window` `"resize"` events; when fired and `imagesLoaded` is true, call `drawFrame(currentFrameRef.current)`
    - Return cleanup removing the event listener
    - _Requirements: 4.9, 5.8_

- [ ] 4. Implement Scroll Progress Tracking and Frame Updates
  - [ ] 4.1 Wire `useScroll` and `useMotionValueEvent` for frame-index updates
    - Attach `useScroll` to `containerRef` with `offset: ["start start", "end start"]`
    - In `useMotionValueEvent` on `"change"`, compute `frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(latest * TOTAL_FRAMES))`
    - Only proceed if `imagesLoaded` and `frameIndex !== currentFrameRef.current`
    - Cancel any pending `rafRef.current` before scheduling a new `requestAnimationFrame(() => drawFrame(frameIndex))`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8_

- [ ] 5. Checkpoint — verify canvas rendering and scroll animation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement the Text Overlay System
  - [ ] 6.1 Define all `useTransform` values for opacity and position
    - `headline1Opacity`: `[0, 0.15, 0.25] → [1, 0.5, 0]`
    - `feature1Opacity`: `[0.25, 0.35, 0.45, 0.5] → [0, 1, 1, 0]`
    - `feature2Opacity`: `[0.5, 0.6, 0.7, 0.75] → [0, 1, 1, 0]`
    - `ctaOpacity`: `[0.75, 0.85, 1] → [0, 1, 1]`
    - `headline1Y`: `[0, 0.25] → [0, -20]`
    - `feature1X`: `[0.25, 0.5] → [-80, 0]`
    - `feature2X`: `[0.5, 0.75] → [80, 0]`
    - `ctaY`: `[0.75, 1] → [20, 0]`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 7.2, 7.3, 7.5_

  - [ ] 6.2 Render the four `motion.div` text overlay elements in JSX
    - Wrap all four in `<div className="scroll-overlays">` with `pointer-events: none`
    - Headline (`className="scroll-overlay-text headline-1"`): `style={{ opacity: headline1Opacity, y: headline1Y }}` — contains `<h2>` and `<p>`
    - Feature 1 (`className="scroll-overlay-text feature-1"`): `style={{ opacity: feature1Opacity, x: feature1X }}` — contains `<h3>` and `<p>`
    - Feature 2 (`className="scroll-overlay-text feature-2"`): `style={{ opacity: feature2Opacity, x: feature2X }}` — contains `<h3>` and `<p>`
    - CTA (`className="scroll-overlay-text cta"`): `style={{ opacity: ctaOpacity, y: ctaY }}` — contains `<h3>` and `<p>`
    - _Requirements: 1.4, 1.5, 1.8, 3.8, 6.6, 10.5_

- [ ] 7. Implement the Accessibility Layer
  - [ ] 7.1 Add `prefers-reduced-motion` detection and conditional rendering
    - Detect `window.matchMedia("(prefers-reduced-motion: reduce)").matches` inside a `useEffect` or at render time using a state variable initialized via `useEffect`
    - When reduced motion is active: render a static `<div className="static-reveal">` containing the canvas (draw frame 10 once on mount) and all four text headings simultaneously without opacity animations
    - When reduced motion is inactive: render the normal animated sticky wrapper
    - _Requirements: 6.2, 6.3_

  - [ ] 7.2 Add ARIA attributes, loading indicator, and error fallback JSX
    - Add `aria-label="Scroll-driven product reveal animation"` to the `<canvas>` element
    - Render the loading indicator only when `!imagesLoaded && !loadError`: `<div className="canvas-loader" role="status" aria-live="polite"><div className="loader-spinner" /><p>Loading animation…</p></div>`
    - Render the error fallback only when `loadError`: `<div className="canvas-error" role="alert"><p>Unable to load animation. Please refresh the page.</p></div>`
    - _Requirements: 6.1, 6.5, 6.7, 6.8, 8.3, 8.5_

- [ ] 8. Update CSS in `globals.css` for Apple aesthetic and responsive layout
  - [ ] 8.1 Update `.sticky-scroll-container` to `height: 400vh` and `background: #000000`; add `@media (max-width: 768px)` rule setting `height: 300vh`
    - Update `.sticky-wrapper` to `height: 100vh` and `background: #000000`
    - Ensure `.sticky-canvas` has `width: 100%; height: 100%; display: block;` (no `max-width` constraint)
    - _Requirements: 1.1, 1.3, 5.1, 5.2, 10.2, 10.3_

  - [ ] 8.2 Update text overlay typography and positioning CSS
    - `.scroll-overlay-text h2`: `font-size: clamp(2rem, 5vw, 4rem)`, `font-weight: 800`, `letter-spacing: -0.02em`, `text-shadow: 0 2px 8px rgba(0,0,0,0.6)`
    - `.scroll-overlay-text h3`: `font-size: clamp(1.5rem, 3.5vw, 3rem)`, `font-weight: 700`, `letter-spacing: -0.01em`, `color: var(--accent-purple)`
    - `.scroll-overlay-text p`: `font-size: clamp(0.95rem, 1.2vw, 1.1rem)`, `line-height: 1.6`, `color: rgba(255,255,255,0.9)`, `letter-spacing: 0.01em`
    - `.scroll-overlay-text`: `backdrop-filter: blur(6px)`, `background: rgba(0,0,0,0.4)`, `border-radius: 8px`, `padding: 1.5rem`
    - Add `@media (max-width: 640px)` rule reducing `.scroll-overlay-text` padding to `1rem`
    - _Requirements: 1.4, 1.5, 1.6, 1.8, 3.8, 5.4, 5.5, 6.4, 10.4, 10.5_

- [ ] 9. Final checkpoint — full integration and accessibility verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design document contains no "Correctness Properties" section, so property-based tests are not applicable; unit/integration tests are used instead
- All implementation is confined to `src/components/StickyScrollCanvas.tsx` and `src/app/globals.css` — no new files or dependencies
- The component must export `default function StickyScrollCanvas()` to maintain API compatibility with `page.tsx`
- Frame assets live in `/public/sit/` and are referenced via the `getFramePath` helper; no file moves required
- The `crossOrigin: "anonymous"` attribute on preloaded images is required for canvas `drawImage` to work without tainting the canvas

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "4.1"] },
    { "id": 3, "tasks": ["6.1", "8.1"] },
    { "id": 4, "tasks": ["6.2", "8.2"] },
    { "id": 5, "tasks": ["7.1", "7.2"] }
  ]
}
```
