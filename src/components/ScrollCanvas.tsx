"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

const TOTAL_FRAMES = 10;

function getFramePath(index: number): string {
  return `/frames/frame_${index + 1}.jpg`;
}

export default function ScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[frameIndex];
    if (!canvas || !ctx || !img) return;

    // Set canvas size to match viewport
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Cover-fit the image
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = rect.width / rect.height;

    let drawWidth: number, drawHeight: number, drawX: number, drawY: number;
    if (imgAspect > canvasAspect) {
      drawHeight = rect.height;
      drawWidth = rect.height * imgAspect;
      drawX = (rect.width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = rect.width;
      drawHeight = rect.width / imgAspect;
      drawX = 0;
      drawY = (rect.height - drawHeight) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  // Preload all images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setImagesLoaded(true);
          // Draw first frame
          drawFrame(0);
        }
      };
      images.push(img);
    }
  }, []);

  // Listen to scroll
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!imagesLoaded) return;

    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(latest * TOTAL_FRAMES)
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
    }
  });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (imagesLoaded) {
        drawFrame(currentFrameRef.current);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imagesLoaded]);

  return (
    <div ref={containerRef} className="scroll-container">
      <canvas
        ref={canvasRef}
        className="scroll-canvas"
        aria-label="Scroll-driven portrait animation"
      />

      {/* Loading indicator */}
      {!imagesLoaded && (
        <div className="canvas-loader">
          <div className="loader-spinner" />
          <p>Loading experience…</p>
        </div>
      )}
    </div>
  );
}
