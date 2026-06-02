"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "framer-motion";

const FRAME_NAMES = [
  "001",
  "002",
  "003",
  "010",
  "011",
  "012",
  "013",
  "014",
  "015",
  "016",
  "017",
  "018",
  "019",
  "020",
  "021",
  "022",
  "023",
  "024",
  "025",
  "026",
] as const;

const TOTAL_FRAMES = FRAME_NAMES.length;
const IMAGE_TIMEOUT_MS = 10_000;
const REDUCED_MOTION_FRAME_INDEX = 10;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_INTERACTION = { stiffness: 100, damping: 20 };

type LoadState = "loading" | "ready" | "unavailable" | "unsupported";

type OverlayCopy = {
  eyebrow: string;
  title: string;
  body: string;
};

const OVERLAY_COPY: OverlayCopy[] = [
  {
    eyebrow: "Section 03",
    title: "What I Do",
    body: "I design and build practical digital solutions across hardware, software, and support systems.",
  },
  {
    eyebrow: "Specialty 01",
    title: "IoT And Embedded Systems",
    body: "I connect devices, sensors, and software into reliable embedded solutions for real-world use cases.",
  },
  {
    eyebrow: "Specialty 02",
    title: "Fullstack Developer",
    body: "I build complete products from frontend interfaces to backend APIs, databases, and deployment.",
  },
  {
    eyebrow: "Specialty 03",
    title: "IT Specialist And Help Desk",
    body: "I provide technical support, troubleshooting, and system guidance to keep teams productive and stable.",
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getFramePath(index: number): string {
  const frameName = FRAME_NAMES[clamp(index, 0, TOTAL_FRAMES - 1)];
  return `/sit/ezgif-frame-${frameName}.jpg`;
}

function findNearestLoadedFrame(
  images: Array<HTMLImageElement | null>,
  requestedIndex: number,
): { image: HTMLImageElement; index: number } | null {
  for (let distance = 0; distance < images.length; distance += 1) {
    const lowerIndex = requestedIndex - distance;
    const upperIndex = requestedIndex + distance;

    if (lowerIndex >= 0) {
      const lowerImage = images[lowerIndex];
      if (lowerImage) {
        return { image: lowerImage, index: lowerIndex };
      }
    }

    if (upperIndex < images.length) {
      const upperImage = images[upperIndex];
      if (upperImage) {
        return { image: upperImage, index: upperIndex };
      }
    }
  }

  return null;
}

export default function StickyScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Array<HTMLImageElement | null>>([]);
  const currentFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const initialFramePaintedRef = useRef<boolean>(false);
  const prefersReducedMotion = useReducedMotion();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [initialFrameVisible, setInitialFrameVisible] = useState<boolean>(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const openingOpacity = useTransform(scrollYProgress, [0, 0.1, 0.25], [1, 1, 0]);
  const featureOneOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.55], [0, 1, 0]);
  const featureTwoOpacity = useTransform(scrollYProgress, [0.45, 0.6, 0.75], [0, 1, 0]);
  const closingOpacity = useTransform(scrollYProgress, [0.75, 0.9, 1], [0, 1, 1]);

  const openingX = useTransform(scrollYProgress, [0, 0.25], [-80, 0]);
  const featureOneX = useTransform(scrollYProgress, [0.25, 0.4], [-80, 0]);
  const featureTwoX = useTransform(scrollYProgress, [0.45, 0.6], [-80, 0]);
  const closingX = useTransform(scrollYProgress, [0.75, 0.9], [-80, 0]);

  const openingY = useTransform(scrollYProgress, [0, 0.25], [-20, 0]);
  const featureOneY = useTransform(scrollYProgress, [0.25, 0.4], [-20, 0]);
  const featureTwoY = useTransform(scrollYProgress, [0.45, 0.6], [-20, 0]);
  const closingY = useTransform(scrollYProgress, [0.75, 0.9], [-20, 0]);

  /**
   * Draws a single sequence frame to the canvas using object-fit: contain math.
   * The canvas backing store is scaled by DPR so the reveal stays crisp on
   * high-density displays while preserving the source frame aspect ratio.
   */
  const drawFrame = useCallback((frameIndex: number): boolean => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return false;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setLoadState("unsupported");
      return false;
    }

    const resolvedFrame = findNearestLoadedFrame(imagesRef.current, frameIndex);
    if (!resolvedFrame) {
      return false;
    }

    const { image, index } = resolvedFrame;
    if (image.naturalWidth === 0 || image.naturalHeight === 0) {
      console.warn(`[StickyScrollCanvas] Skipping frame ${index}: image has no natural size.`);
      return false;
    }

    try {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }

      const dpr = clamp(window.devicePixelRatio || 1, 1, 3);
      const nextWidth = Math.round(rect.width * dpr);
      const nextHeight = Math.round(rect.height * dpr);

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const imageAspect = image.naturalWidth / image.naturalHeight;
      const canvasAspect = rect.width / rect.height;
      let drawWidth: number;
      let drawHeight: number;

      if (imageAspect > canvasAspect) {
        drawWidth = rect.width;
        drawHeight = rect.width / imageAspect;
      } else {
        drawHeight = rect.height;
        drawWidth = rect.height * imageAspect;
      }

      const drawX = (rect.width - drawWidth) / 2;
      const drawY = (rect.height - drawHeight) / 2;

      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      return true;
    } catch (error) {
      console.error(`[StickyScrollCanvas] Failed to render frame ${frameIndex}.`, error);
      return false;
    }
  }, []);

  const scheduleFrame = useCallback(
    (frameIndex: number): void => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const didDraw = drawFrame(frameIndex);
        rafRef.current = null;

        if (didDraw && !initialFramePaintedRef.current) {
          initialFramePaintedRef.current = true;
          setInitialFrameVisible(true);
        }
      });
    },
    [drawFrame],
  );

  /**
   * Loads every animation frame and resolves each request independently. Failed
   * frames are left as null so the renderer can fall back to the nearest loaded
   * neighbor without blocking the entire reveal.
   */
  useEffect(() => {
    let isMounted = true;
    const timeoutHandles: number[] = [];

    const loadFrame = (index: number): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        const image = new Image();
        const path = getFramePath(index);
        const timeoutId = window.setTimeout(() => {
          console.error(`[StickyScrollCanvas] Timed out loading frame: ${path}`);
          resolve(null);
        }, IMAGE_TIMEOUT_MS);

        timeoutHandles.push(timeoutId);
        image.crossOrigin = "anonymous";
        image.onload = () => {
          window.clearTimeout(timeoutId);
          console.log(`[StickyScrollCanvas] Loaded frame ${index + 1}/${TOTAL_FRAMES}: ${path}`);
          resolve(image);
        };
        image.onerror = () => {
          window.clearTimeout(timeoutId);
          console.error(`[StickyScrollCanvas] Failed to load frame: ${path}`);
          resolve(null);
        };
        image.src = path;
      });

    Promise.all(FRAME_NAMES.map((_, index) => loadFrame(index))).then((images) => {
      if (!isMounted) {
        return;
      }

      imagesRef.current = images;
      const hasRenderableFrame = images.some(Boolean);

      if (!hasRenderableFrame) {
        setLoadState("unavailable");
        return;
      }

      setLoadState("ready");
      const firstFrame = prefersReducedMotion
        ? clamp(REDUCED_MOTION_FRAME_INDEX, 0, TOTAL_FRAMES - 1)
        : 0;
      currentFrameRef.current = firstFrame;
      window.setTimeout(() => scheduleFrame(firstFrame), 0);
    });

    return () => {
      isMounted = false;
      timeoutHandles.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [prefersReducedMotion, scheduleFrame]);

  useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
    if (loadState !== "ready" || prefersReducedMotion) {
      return;
    }

    const frameIndex = Math.round(clamp(latest, 0, 1) * (TOTAL_FRAMES - 1));
    if (frameIndex === currentFrameRef.current) {
      return;
    }

    currentFrameRef.current = frameIndex;
    scheduleFrame(frameIndex);
  });

  useEffect(() => {
    if (loadState !== "ready") {
      return undefined;
    }

    let resizeRaf: number | null = null;
    const redrawCurrentFrame = (): void => {
      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }

      resizeRaf = requestAnimationFrame(() => {
        const frameIndex = prefersReducedMotion
          ? clamp(REDUCED_MOTION_FRAME_INDEX, 0, TOTAL_FRAMES - 1)
          : currentFrameRef.current;
        scheduleFrame(frameIndex);
        resizeRaf = null;
      });
    };

    const observer = new ResizeObserver(redrawCurrentFrame);
    const canvas = canvasRef.current;

    if (canvas) {
      observer.observe(canvas);
    }

    window.addEventListener("resize", redrawCurrentFrame);
    window.addEventListener("orientationchange", redrawCurrentFrame);

    return () => {
      if (resizeRaf !== null) {
        cancelAnimationFrame(resizeRaf);
      }

      observer.disconnect();
      window.removeEventListener("resize", redrawCurrentFrame);
      window.removeEventListener("orientationchange", redrawCurrentFrame);
    };
  }, [loadState, prefersReducedMotion, scheduleFrame]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const reducedMotionStyle: MotionStyle = { opacity: 1, x: 0, y: 0 };
  const hiddenFallbackStyle: CSSProperties = {
    opacity: loadState === "ready" && initialFrameVisible ? 0 : 1,
  };

  const overlayStyles: MotionStyle[] = prefersReducedMotion
    ? [reducedMotionStyle, reducedMotionStyle, reducedMotionStyle, reducedMotionStyle]
    : [
        { opacity: openingOpacity, x: openingX, y: openingY },
        { opacity: featureOneOpacity, x: featureOneX, y: featureOneY },
        { opacity: featureTwoOpacity, x: featureTwoX, y: featureTwoY },
        { opacity: closingOpacity, x: closingX, y: closingY },
      ];

  return (
    <section ref={containerRef} className="sticky-scroll-container" aria-label="What I do reveal">
      <div className="sticky-wrapper">
        <motion.canvas
          ref={canvasRef}
          className="sticky-canvas"
          aria-label="Scroll-driven product reveal animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: loadState === "ready" && initialFrameVisible ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        />

        <div
          className={`scroll-overlays${prefersReducedMotion ? " reduced-motion" : ""}`}
          aria-live="off"
        >
          {OVERLAY_COPY.map((copy, index) => {
            const Heading = index === 0 ? "h2" : "h3";

            return (
              <motion.article
                className={`scroll-overlay-text overlay-phase-${index + 1}`}
                key={copy.title}
                style={overlayStyles[index]}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", ...SPRING_INTERACTION }}
              >
                <p className="overlay-eyebrow">{copy.eyebrow}</p>
                <Heading>{copy.title}</Heading>
                <p>{copy.body}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="sticky-reveal-vignette" aria-hidden="true" />

        {loadState === "loading" && (
          <div className="canvas-loader" role="status" aria-live="polite">
            <div className="loader-spinner" aria-hidden="true" />
            <p>Loading animation&hellip;</p>
          </div>
        )}

        {loadState === "unavailable" && (
          <div className="canvas-fallback" style={hiddenFallbackStyle}>
            <h2>Animation unavailable</h2>
            <p>Unable to load animation. Please refresh the page.</p>
          </div>
        )}

        {loadState === "unsupported" && (
          <div className="canvas-fallback" style={hiddenFallbackStyle}>
            <h2>Canvas not supported in this browser</h2>
            <p>The reveal needs canvas support to render the frame sequence.</p>
          </div>
        )}
      </div>
    </section>
  );
}
