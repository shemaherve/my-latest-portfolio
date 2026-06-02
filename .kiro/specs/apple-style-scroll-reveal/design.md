# Design Document

## Overview

This design document specifies the technical architecture and implementation approach for transforming the existing `StickyScrollCanvas` component into a premium Apple-style scroll reveal experience. The design focuses on high-performance canvas rendering, smooth scroll-driven animations, cinematic text overlays, and accessibility compliance while maintaining seamless integration with the existing Next.js portfolio.

## Architecture

### Component Structure

```
StickyScrollCanvas (Main Component)
├── Frame Preloader System
│   ├── Image Loading Logic
│   ├── Loading State Management
│   └── Error Handling
├── Canvas Renderer
│   ├── DPR-Aware Rendering
│   ├── Frame Drawing Logic
│   └── Resize Handler
├── Scroll Progress Tracker
│   ├── Framer Motion useScroll Hook
│   └── Frame Index Calculation
├── Text Overlay System
│   ├── Headline Overlay (0-25% scroll)
│   ├── Feature 1 Overlay (25-50% scroll)
│   ├── Feature 2 Overlay (50-75% scroll)
│   └── CTA Overlay (75-100% scroll)
└── Accessibility Layer
    ├── Reduced Motion Detection
    ├── ARIA Labels
    └── Fallback States
```

### Data Flow

```
User Scroll Event
    ↓
Framer Motion useScroll Hook
    ↓
Scroll Progress (0.0 - 1.0)
    ↓
Frame Index Calculation (0 - 19)
    ↓
requestAnimationFrame
    ↓
Canvas Renderer (drawFrame)
    ↓
Visual Update
```

## Component Design

### 1. Frame Configuration System

**Purpose:** Centralize frame metadata and path generation logic.

**Implementation:**

```typescript
// Constants at top of file
const FRAME_NAMES = [
  "001", "002", "003", "010", "011", "012", "013", "014", "015", "016",
  "017", "018", "019", "020", "021", "022", "023", "024", "025", "026"
];
const TOTAL_FRAMES = FRAME_NAMES.length; // 20 frames

/**
 * Generates the public path for a frame image
 * @param index - Frame index (0-19)
 * @returns Public path to frame image
 */
function getFramePath(index: number): string {
  return `/sit/ezgif-frame-${FRAME_NAMES[index]}.jpg`;
}
```

**Rationale:** 
- Pure function for testability
- Centralized frame naming logic
- Easy to modify frame sources
- Type-safe with explicit parameter types

### 2. Frame Preloader System

**Purpose:** Load all animation frames before user interaction to ensure smooth playback.

**Implementation Strategy:**

```typescript
useEffect(() => {
  let loadedCount = 0;
  const imgs: HTMLImageElement[] = [];
  let isMounted = true;
  const timeouts: NodeJS.Timeout[] = [];

  const checkComplete = () => {
    loadedCount++;
    console.log(`✓ Loaded frame ${loadedCount}/${TOTAL_FRAMES}`);
    
    if (loadedCount === TOTAL_FRAMES && isMounted) {
      imagesRef.current = imgs;
      setImagesLoaded(true);
      // Trigger initial render after 100ms
      setTimeout(() => drawFrame(0), 100);
    }
  };

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable canvas rendering
    
    // 10-second timeout per frame
    const timeoutId = setTimeout(() => {
      console.error(`⏱ Timeout loading frame ${i}: ${getFramePath(i)}`);
      checkComplete();
    }, 10000);
    timeouts.push(timeoutId);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      checkComplete();
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      console.error(`✗ Failed to load: ${getFramePath(i)}`);
      checkComplete();
    };
    
    img.src = getFramePath(i);
    imgs.push(img);
  }

  return () => {
    isMounted = false;
    timeouts.forEach(clearTimeout);
  };
}, [drawFrame]);
```

**Key Features:**
- Asynchronous parallel loading
- Per-frame timeout (10 seconds)
- Console logging for debugging
- Cleanup on unmount
- Cross-origin support for canvas

### 3. Canvas Renderer System

**Purpose:** Render frames with high quality, DPR awareness, and proper aspect ratio handling.

**Implementation Strategy:**

```typescript
const drawFrame = useCallback((frameIndex: number) => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext("2d");
  const img = imagesRef.current[frameIndex];
  
  if (!canvas || !ctx || !img) return;

  try {
    // Get display dimensions
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set internal resolution for crisp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale context for DPR
    ctx.scale(dpr, dpr);
    
    // Clear with black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Validate image loaded
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.warn(`Image not loaded: frame ${frameIndex}`);
      return;
    }
    
    // Calculate object-fit: contain dimensions
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = rect.width / rect.height;
    
    let drawWidth: number, drawHeight: number, drawX: number, drawY: number;
    
    if (imgAspect > canvasAspect) {
      // Image wider - fit to width
      drawWidth = rect.width;
      drawHeight = rect.width / imgAspect;
      drawX = 0;
      drawY = (rect.height - drawHeight) / 2;
    } else {
      // Image taller - fit to height
      drawHeight = rect.height;
      drawWidth = rect.height * imgAspect;
      drawX = (rect.width - drawWidth) / 2;
      drawY = 0;
    }
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Draw frame
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
  } catch (error) {
    console.error(`Error rendering frame ${frameIndex}:`, error);
  }
}, []);
```

**Key Features:**
- DPR-aware resolution (2x, 3x displays)
- Object-fit contain logic (no distortion)
- High-quality anti-aliasing
- Error handling with try-catch
- Centered frame positioning

### 4. Scroll Progress Tracking System

**Purpose:** Map scroll position to frame indices with precise control.

**Implementation Strategy:**

```typescript
const containerRef = useRef<HTMLDivElement>(null);
const currentFrameRef = useRef(0);
const rafRef = useRef<number | null>(null);

// Track scroll progress
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start start", "end start"]
});

// Update frame on scroll
useMotionValueEvent(scrollYProgress, "change", (latest) => {
  if (!imagesLoaded) return;
  
  // Map 0.0-1.0 to frame index 0-19
  const frameIndex = Math.min(
    TOTAL_FRAMES - 1,
    Math.floor(latest * TOTAL_FRAMES)
  );
  
  // Only render if frame changed
  if (frameIndex !== currentFrameRef.current) {
    currentFrameRef.current = frameIndex;
    
    // Cancel pending frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Schedule new frame
    rafRef.current = requestAnimationFrame(() => {
      drawFrame(frameIndex);
    });
  }
});
```

**Key Features:**
- Linear scroll-to-frame mapping
- Frame deduplication (only render on change)
- requestAnimationFrame for smooth updates
- Cancellation of pending frames

### 5. Text Overlay System

**Purpose:** Display cinematic text overlays synchronized with scroll progress.

**Implementation Strategy:**

```typescript
// Opacity transforms for each text phase
const headline1Opacity = useTransform(
  scrollYProgress, 
  [0, 0.15, 0.25], 
  [1, 0.5, 0]
);

const feature1Opacity = useTransform(
  scrollYProgress, 
  [0.25, 0.35, 0.45, 0.5], 
  [0, 1, 1, 0]
);

const feature2Opacity = useTransform(
  scrollYProgress, 
  [0.5, 0.6, 0.7, 0.75], 
  [0, 1, 1, 0]
);

const ctaOpacity = useTransform(
  scrollYProgress, 
  [0.75, 0.85, 1], 
  [0, 1, 1]
);

// Position transforms for subtle movement
const headline1Y = useTransform(
  scrollYProgress, 
  [0, 0.25], 
  [0, -20]
);

const feature1X = useTransform(
  scrollYProgress, 
  [0.25, 0.5], 
  [-80, 0]
);

const feature2X = useTransform(
  scrollYProgress, 
  [0.5, 0.75], 
  [80, 0]
);

const ctaY = useTransform(
  scrollYProgress, 
  [0.75, 1], 
  [20, 0]
);
```

**JSX Structure:**

```typescript
<div className="scroll-overlays">
  {/* Headline - 0-25% scroll */}
  <motion.div
    className="scroll-overlay-text headline-1"
    style={{ opacity: headline1Opacity, y: headline1Y }}
  >
    <h2>Experience the Journey</h2>
    <p>Discover innovation in motion</p>
  </motion.div>

  {/* Feature 1 - 25-50% scroll */}
  <motion.div
    className="scroll-overlay-text feature-1"
    style={{ opacity: feature1Opacity, x: feature1X }}
  >
    <h3>Seamless Expansion</h3>
    <p>Watch as every component reveals itself with precision</p>
  </motion.div>

  {/* Feature 2 - 50-75% scroll */}
  <motion.div
    className="scroll-overlay-text feature-2"
    style={{ opacity: feature2Opacity, x: feature2X }}
  >
    <h3>Precision Engineering</h3>
    <p>Intricate details working in perfect harmony</p>
  </motion.div>

  {/* CTA - 75-100% scroll */}
  <motion.div
    className="scroll-overlay-text cta"
    style={{ opacity: ctaOpacity, y: ctaY }}
  >
    <h3>Perfect Assembly</h3>
    <p>Every piece aligned with purpose</p>
  </motion.div>
</div>
```

**Key Features:**
- Overlapping animation ranges for smooth crossfades
- Subtle position transforms (translateX, translateY)
- Semantic HTML (h2, h3 tags)
- Responsive font sizing with clamp()

### 6. Responsive Design System

**Purpose:** Adapt layout and performance across device sizes.

**CSS Strategy:**

```css
/* Desktop - 400vh scroll distance */
.sticky-scroll-container {
  height: 400vh;
}

/* Mobile - 300vh scroll distance */
@media (max-width: 768px) {
  .sticky-scroll-container {
    height: 300vh;
  }
  
  .scroll-overlay-text {
    padding: 1rem;
  }
  
  .scroll-overlay-text h2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }
  
  .scroll-overlay-text h3 {
    font-size: clamp(1.2rem, 3vw, 2rem);
  }
  
  .scroll-overlay-text p {
    font-size: clamp(0.85rem, 1vw, 0.95rem);
  }
}

/* Compact mobile */
@media (max-width: 640px) {
  .scroll-overlay-text {
    padding: 1rem;
  }
}
```

**JavaScript Strategy:**

```typescript
// Resize handler
useEffect(() => {
  const handleResize = () => {
    if (imagesLoaded) {
      // Redraw current frame with new dimensions
      drawFrame(currentFrameRef.current);
    }
  };
  
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [imagesLoaded, drawFrame]);
```

### 7. Accessibility Layer

**Purpose:** Ensure inclusive experience for all users.

**Implementation Strategy:**

```typescript
// Detect reduced motion preference
const prefersReducedMotion = 
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Conditional rendering based on preference
{prefersReducedMotion ? (
  // Static view - frame 10 (middle frame)
  <div className="static-reveal">
    <canvas 
      ref={canvasRef} 
      className="sticky-canvas"
      aria-label="Scroll-driven product reveal animation"
    />
    <div className="static-text-content">
      <h2>Experience the Journey</h2>
      <h3>Seamless Expansion</h3>
      <h3>Precision Engineering</h3>
      <h3>Perfect Assembly</h3>
    </div>
  </div>
) : (
  // Animated view (normal implementation)
  <div className="sticky-wrapper">
    <canvas 
      ref={canvasRef} 
      className="sticky-canvas"
      aria-label="Scroll-driven product reveal animation"
    />
    {/* Text overlays with animations */}
  </div>
)}

// Loading indicator with ARIA
{!imagesLoaded && (
  <div 
    className="canvas-loader"
    role="status"
    aria-live="polite"
  >
    <div className="loader-spinner" />
    <p>Loading animation…</p>
  </div>
)}

// Error fallback
{loadError && (
  <div 
    className="canvas-error"
    role="alert"
  >
    <p>Unable to load animation. Please refresh the page.</p>
  </div>
)}
```

**Key Features:**
- `prefers-reduced-motion` detection
- Static frame display for reduced motion
- ARIA labels on canvas
- `role="status"` on loading indicator
- `role="alert"` on error messages
- Semantic heading structure

### 8. Performance Optimization

**Strategies:**

1. **Memoization:**
```typescript
const drawFrame = useCallback((frameIndex: number) => {
  // Drawing logic
}, []); // No dependencies - stable reference
```

2. **Ref Usage (Avoid Re-renders):**
```typescript
const imagesRef = useRef<HTMLImageElement[]>([]);
const currentFrameRef = useRef(0);
const rafRef = useRef<number | null>(null);
```

3. **Frame Deduplication:**
```typescript
if (frameIndex !== currentFrameRef.current) {
  // Only render if frame changed
}
```

4. **RAF Cancellation:**
```typescript
if (rafRef.current) {
  cancelAnimationFrame(rafRef.current);
}
rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
```

5. **DPR Capping (Optional):**
```typescript
const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x
```

### 9. Error Handling Strategy

**Comprehensive Error Coverage:**

```typescript
// Frame loading errors
img.onerror = () => {
  console.error(`✗ Failed to load: ${getFramePath(i)}`);
  checkComplete(); // Continue loading other frames
};

// Frame loading timeout
const timeoutId = setTimeout(() => {
  console.error(`⏱ Timeout loading frame ${i}`);
  checkComplete();
}, 10000);

// Canvas context error
const ctx = canvas?.getContext("2d");
if (!ctx) {
  console.error("Canvas context not available");
  setLoadError(true);
  return;
}

// Image validation error
if (img.naturalWidth === 0 || img.naturalHeight === 0) {
  console.warn(`Image not loaded: frame ${frameIndex}`);
  return;
}

// Rendering error
try {
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
} catch (error) {
  console.error(`Error rendering frame ${frameIndex}:`, error);
}
```

### 10. CSS Design System

**Color Palette:**
```css
:root {
  --background: #000000;
  --foreground: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.9);
  --accent-purple: #9d68ff;
  --overlay-bg: rgba(0, 0, 0, 0.4);
}
```

**Typography:**
```css
.scroll-overlay-text h2 {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--foreground);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.scroll-overlay-text h3 {
  font-size: clamp(1.5rem, 3.5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--accent-purple);
}

.scroll-overlay-text p {
  font-size: clamp(0.95rem, 1.2vw, 1.1rem);
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}
```

**Layout:**
```css
.sticky-scroll-container {
  position: relative;
  width: 100%;
  height: 400vh; /* 4x viewport height for scroll distance */
  background: #000000;
  z-index: 30;
}

.sticky-wrapper {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000000;
}

.sticky-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
```

**Text Overlay Positioning:**
```css
/* Headline - Top Center */
.headline-1 {
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Feature 1 - Bottom Left */
.feature-1 {
  bottom: 8%;
  left: 3%;
  text-align: left;
}

/* Feature 2 - Bottom Right */
.feature-2 {
  bottom: 8%;
  right: 3%;
  text-align: right;
}

/* CTA - Bottom Center */
.cta {
  bottom: 3%;
  left: 50%;
  transform: translateX(-50%);
}
```

## Integration Points

### 1. Page Integration

**File:** `/src/app/page.tsx`

```typescript
import StickyScrollCanvas from "@/components/StickyScrollCanvas";

export default function Home() {
  return (
    <main className="portfolio-v2">
      <Header />
      <CursorExperience />
      <StickyScrollCanvas /> {/* Section 3 */}
      <div className="post-scroll-spacer">
        <section id="work" className="content-section-min">
          {/* Work section */}
        </section>
      </div>
    </main>
  );
}
```

### 2. CSS Integration

**File:** `/src/app/globals.css`

The component uses existing CSS classes:
- `.sticky-scroll-container`
- `.sticky-wrapper`
- `.sticky-canvas`
- `.scroll-overlays`
- `.scroll-overlay-text`
- `.canvas-loader`

No new CSS files required - all styles in `globals.css`.

### 3. Frame Assets

**Directory:** `/public/sit/`

Frames used:
- `ezgif-frame-001.jpg` through `ezgif-frame-026.jpg` (with gaps)
- Total: 20 frames
- Format: JPEG
- No file reorganization required

## Type Definitions

```typescript
// Component Props (none - default export)
export default function StickyScrollCanvas(): JSX.Element;

// Internal Types
type FrameIndex = number; // 0-19
type ScrollProgress = number; // 0.0-1.0
type DPR = number; // 1, 2, 3

interface CanvasDimensions {
  width: number;
  height: number;
  dpr: DPR;
}

interface DrawParams {
  drawX: number;
  drawY: number;
  drawWidth: number;
  drawHeight: number;
}
```

## Testing Strategy

### Manual Testing Checklist

1. **Frame Loading:**
   - [ ] All 20 frames load successfully
   - [ ] Console logs show loading progress
   - [ ] Loading indicator displays during load
   - [ ] Initial frame renders after load

2. **Scroll Animation:**
   - [ ] Frames transition smoothly on scroll
   - [ ] Frame 0 at scroll start
   - [ ] Frame 19 at scroll end
   - [ ] Reverse scroll works smoothly

3. **Text Overlays:**
   - [ ] Headline visible at 0% scroll
   - [ ] Feature 1 visible at 30% scroll
   - [ ] Feature 2 visible at 60% scroll
   - [ ] CTA visible at 90% scroll
   - [ ] Smooth opacity transitions

4. **Responsive Design:**
   - [ ] Works on desktop (1920x1080)
   - [ ] Works on tablet (768px)
   - [ ] Works on mobile (375px)
   - [ ] Resize handler works

5. **Performance:**
   - [ ] 60fps during scroll
   - [ ] No frame drops
   - [ ] Smooth on 2x DPR displays

6. **Accessibility:**
   - [ ] Reduced motion shows static frame
   - [ ] ARIA labels present
   - [ ] Keyboard scrolling works
   - [ ] Screen reader announces loading

7. **Error Handling:**
   - [ ] Failed frame loads don't block
   - [ ] Error messages display correctly
   - [ ] Console errors are informative

## Performance Budget

| Metric | Target | Maximum |
|--------|--------|---------|
| Frame render time | 8ms | 16ms (60fps) |
| Initial load time | 2s | 3s |
| Frame load time | 500ms | 10s (timeout) |
| Memory usage | 50MB | 100MB |
| Canvas resolution (2x DPR) | 3840x2160 | 7680x4320 |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- Canvas 2D API
- requestAnimationFrame
- ResizeObserver
- CSS sticky positioning
- Framer Motion (React 18+)

## Deployment Considerations

1. **Image Optimization:**
   - Frames already in JPEG format (good compression)
   - Consider WebP conversion for 30% size reduction
   - Total frame size: ~2-4MB (acceptable)

2. **CDN Strategy:**
   - Serve frames from CDN for faster loading
   - Enable HTTP/2 for parallel downloads
   - Set cache headers (1 year)

3. **Progressive Enhancement:**
   - Component works without JavaScript (shows static frame)
   - Fallback for canvas not supported
   - Reduced motion support built-in

## Future Enhancements

1. **WebP Support:**
   - Detect WebP support
   - Serve WebP frames when available
   - Fallback to JPEG

2. **Lazy Loading:**
   - Load frames on-demand as user scrolls
   - Reduce initial load time
   - Trade-off: potential frame stuttering

3. **Video Alternative:**
   - Convert frames to video (MP4/WebM)
   - Use video scrubbing for scroll
   - Smaller file size, better compression

4. **Frame Interpolation:**
   - Generate intermediate frames
   - Smoother animation (40+ frames)
   - Requires additional processing

## Summary

This design provides a comprehensive blueprint for implementing a premium Apple-style scroll reveal experience. The architecture prioritizes:

- **Performance:** 60fps rendering with DPR awareness
- **Quality:** High-quality anti-aliasing and smooth animations
- **Accessibility:** Reduced motion support and ARIA labels
- **Maintainability:** Clean code structure with TypeScript
- **Integration:** Seamless fit with existing portfolio

The implementation leverages existing infrastructure (Framer Motion, React, Next.js) without introducing new dependencies, ensuring a smooth development process and minimal risk.
