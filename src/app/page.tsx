"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useSpring, useMotionValue, useTransform, AnimatePresence, useMotionTemplate } from "framer-motion";
import { portfolio } from "@/data/portfolio";

// Frame 5 (rigt (5).png) is dismissed, so we have 9 frames.
// Indices: 0, 1, 2, 3, 5, 6, 7, 8, 9 (skipping 4)
const FRAME_INDICES = [0, 1, 2, 3, 5, 6, 7, 8, 9];
const TOTAL_FRAMES = FRAME_INDICES.length;

function getFramePath(index: number): string {
  // index is 0-8. We map it to the actual file numbers (1-10 skipping 5)
  const actualFileNumber = FRAME_INDICES[index] + 1;
  return `/frames_no_bg/frame_${actualFileNumber}.png`;
}

/* ──────────────────────── Header with Modern 2026 Hamburger ──────────────────────── */
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x: x * 0.3, y: y * 0.3 });
  };

  const navItems = [
    { id: "about", label: "ABOUT", number: "01" },
    { id: "work", label: "WORK", number: "02" },
    { id: "contact", label: "CONTACT", number: "03" },
  ];

  return (
    <header className="site-header-new">
      <div className="header-left">
        <motion.a 
          href="/" 
          className="logo"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >&lt;shemadevro/&gt;</motion.a>
      </div>
      <div className="header-center">{portfolio.owner.email}</div>
      <nav className="header-right">
        <ul className="nav-links">
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#work">WORK</a></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
      </nav>

      {/* Modern 2026 Magnetic Hamburger */}
      <motion.button
        ref={buttonRef}
        className={`hamburger-2026 ${menuOpen ? "open" : ""}`}
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((s) => !s)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setMousePos({ x: 0, y: 0 });
        }}
        animate={{
          x: isHovering ? mousePos.x : 0,
          y: isHovering ? mousePos.y : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <div className="hamburger-lines">
          <motion.span 
            className="line line-1"
            animate={{
              rotate: menuOpen ? 45 : 0,
              y: menuOpen ? 8 : 0,
              width: menuOpen ? 32 : 28,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.span 
            className="line line-2"
            animate={{
              opacity: menuOpen ? 0 : 1,
              x: menuOpen ? -10 : 0,
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
          <motion.span 
            className="line line-3"
            animate={{
              rotate: menuOpen ? -45 : 0,
              y: menuOpen ? -8 : 0,
              width: menuOpen ? 32 : 20,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        <motion.div 
          className="hamburger-glow"
          animate={{
            opacity: isHovering ? 1 : 0,
            scale: isHovering ? 1.2 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-menu-2026"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 2.25rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 2.25rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 2.25rem)" }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="menu-bg-grid" />
            <ul className="menu-items-2026">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <a 
                    href={`#${item.id}`} 
                    onClick={() => setMenuOpen(false)}
                    className={hoveredItem === item.id ? "active" : ""}
                  >
                    <span className="menu-number">{item.number}</span>
                    <span className="menu-label">{item.label}</span>
                    <motion.div 
                      className="menu-arrow"
                      animate={{
                        x: hoveredItem === item.id ? 0 : -20,
                        opacity: hoveredItem === item.id ? 1 : 0,
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      <ArrowRightIcon />
                    </motion.div>
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div 
              className="menu-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p>© 2026 shemadevro</p>
              <div className="menu-socials">
                <a href="#"><GitHubIcon /></a>
                <a href="#"><LinkedInIcon /></a>
                <a href="#"><XIcon /></a>
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ──────────────────── Typing Animation ────────────────── */
function AnimatedName({ name, className, style }: { name: string; className?: string; style?: any }) {
  const letters = name.split("");
  return (
    <motion.h1 className={`hero-name-new smaller-name ${className ?? ""}`} style={style}>
      {letters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.18,
            delay: index * 0.04,
            ease: "easeOut",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/* ──────────────────── Cursor Canvas ───────────────────── */
function CursorExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: shellRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 0.5, 1], [0, 380, 380]);
  // On scroll (2 scrolls), text moves right and hero image expands left
  // Hero: moves to left side when scrolling - increased movement
  const heroX = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, -250, -400]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1.1, 1.2]);
  const heroTranslateX = useTransform(scrollYProgress, [0, 0.2, 0.4], ["0%", "-20%", "-35%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);
  const aboutY = useTransform(scrollYProgress, [0, 0.5, 1], [320, 50, 0]);
  const aboutOpacity = useTransform(scrollYProgress, [0, 0.2, 1], [0, 1, 1]);
  // Text moves to right side on scroll and fades out
  const leftNameX = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 200, 300]);
  const leftNameY = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, -10, -20]);
  const leftNameOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [1, 0.5, 0]);
  // hide intro as soon as the user starts scrolling
  const introOpacity = useTransform(scrollYProgress, [0, 0.02, 0.05, 1], [1, 0, 0, 0]);
  // Smooth the transforms with springs to approximate a 2s shift feel
  const smoothHeroX = useSpring(heroX, { stiffness: 40, damping: 14 });
  const smoothHeroY = useSpring(heroY, { stiffness: 40, damping: 14 });
  const smoothHeroOpacity = useSpring(heroOpacity, { stiffness: 50, damping: 16 });
  const smoothLeftNameOpacity = useSpring(leftNameOpacity, { stiffness: 60, damping: 18 });
  const smoothLeftNameX = useSpring(leftNameX, { stiffness: 50, damping: 18 });
  const smoothLeftNameY = useSpring(leftNameY, { stiffness: 50, damping: 18 });
  const smoothHeroScale = useSpring(heroScale, { stiffness: 40, damping: 16 });
  const smoothHeroTranslateX = useSpring(heroTranslateX, { stiffness: 40, damping: 16 });
  const smoothIntroOpacity = useSpring(introOpacity, { stiffness: 60, damping: 18 });

  // Mouse progress - INCREASED SPEED (higher stiffness, lower damping)
  const mouseX = useMotionValue(0);
  const springMouseX = useSpring(mouseX, { stiffness: 300, damping: 20 });

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imagesRef.current[frameIndex];
    if (!canvas || !ctx || !img) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Boost visibility and slightly zoom the figure
    ctx.filter = "brightness(1.03) contrast(1.05)";

    const imgAspect = img.naturalWidth / img.naturalHeight;

    // Zoom factor (increase to crop in closer). Raised to make figure larger.
    const scale = 1.9;
    let dh = rect.height * 0.95 * scale;
    let dw = dh * imgAspect;

    // Prefer filling horizontally so the figure appears larger on all sides
    if (dw < rect.width * 1.05) {
      dw = rect.width * 1.2;
      dh = dw / imgAspect;
    }

    // Allow more overflow horizontally so the face crops very close to edges
    if (dw > rect.width * 2.0) {
      dw = rect.width * 2.0;
      dh = dw / imgAspect;
    }

    const dx = (rect.width - dw) / 2;
    // Slightly lower placement for similar composition
    const dy = (rect.height - dh) / 2 + rect.height * 0.05;

    // Draw the figure crisply, without colored radial glow or blurred silhouette
    ctx.drawImage(img, dx, dy, dw, dh);








  }, []);

  // Preload
  useEffect(() => {
    let count = 0;
    const imgs: HTMLImageElement[] = [];

    const checkComplete = () => {
      count++;
      if (count === TOTAL_FRAMES) {
        imagesRef.current = imgs;
        setImagesLoaded(true);
        // Force multiple attempts to ensure canvas is ready
        drawFrame(0);
        setTimeout(() => drawFrame(0), 100);
        setTimeout(() => drawFrame(0), 500);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = checkComplete;
      img.onerror = () => {
        console.error(`Failed to load image: ${img.src}`);
        checkComplete();
      };
      imgs.push(img);
    }
  }, [drawFrame]);

  // Handle Mouse Move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const progress = e.clientX / window.innerWidth;
      mouseX.set(progress);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // Update frame
  useEffect(() => {
    return springMouseX.on("change", (latest) => {
      if (!imagesLoaded) return;
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(latest * TOTAL_FRAMES)));
      if (idx !== currentFrameRef.current) {
        currentFrameRef.current = idx;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => drawFrame(idx));
      }
    });
  }, [imagesLoaded, springMouseX, drawFrame]);

  // Handle Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      drawFrame(currentFrameRef.current);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawFrame]);


  return (
    <div className="hero-shell" ref={shellRef}>
      <div className="hero-container-new">
        <div className="social-sidebar">
          <a href="#"><GitHubIcon /></a>
          <a href="#"><LinkedInIcon /></a>
          <a href="#"><XIcon /></a>
          <a href="#"><InstagramIcon /></a>
        </div>

        <div className="hero-grid">
          {/* Left Text - Decreased size and pulled right */}
          <motion.div 
            className="hero-left-text pulled-right"
            style={{ 
              x: smoothLeftNameX,
              y: smoothLeftNameY,
            }}
          >
            <motion.p className="intro-text" style={{ opacity: smoothIntroOpacity }}>Hello! I&apos;m</motion.p>
            <AnimatedName name="Dusabe shema" style={{ opacity: smoothLeftNameOpacity }} />
            <AnimatedName name="Herve" className="hero-last-name" style={{ opacity: smoothLeftNameOpacity }} />
          </motion.div>

          <motion.div 
            className="hero-center-canvas" 
            style={{ 
              y: smoothHeroY, 
              x: smoothHeroX, 
              scale: smoothHeroScale,
              translateX: smoothHeroTranslateX,
              opacity: smoothHeroOpacity 
            }}
          >
            <canvas ref={canvasRef} className="cursor-canvas" />
            {!imagesLoaded && (
              <div className="canvas-loader-simple">
                <div className="loader-spinner" />
              </div>
            )}
          </motion.div>

          {/* Right Text - Updated Role */}
          <motion.div
            className="hero-right-text"
            initial={{ x: 160, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <p className="role-prefix">An</p>
            <h2 className="hero-role-new">FULL STACK<br />DEVELOPER</h2>
          </motion.div>

        </div>

        <div className="resume-link">
          <a href="#">RESUME <ResumeIcon /></a>
        </div>
      </div>

      <motion.section
        id="about"
        className="about-section-min"
        style={{ y: aboutY, opacity: aboutOpacity }}
      >
        <div className="about-heading-block">
          <p className="about-kicker">ABOUT US</p>
          <h2>ABOUT ME</h2>
        </div>
        <div className="about-copy-block">
          <p>{portfolio.owner.summary}</p>
        </div>
      </motion.section>
    </div>
  );
}

/* ──────────────────────── Icons ───────────────────────── */
function GitHubIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>; }
function LinkedInIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>; }
function XIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>; }
function InstagramIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>; }
function ResumeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>; }

function ArrowRightIconSmall() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>; }

/* ──────────────────── Main Page ───────────────────────── */
export default function Home() {
  return (
    <main className="portfolio-v2">
      <Header />
      <CursorExperience />
      <div className="post-scroll-spacer">
        <section id="work" className="content-section-min">
          <h2>WORK</h2>
          <div className="projects-grid-min">
            {portfolio.projects.map((project) => (
              <article key={project.name} className="project-card-min">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
