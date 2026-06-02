"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

type TimelineItem = {
  year: string;
  title: string;
  role: string;
  description: string;
};

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    year: "2022",
    title: "Started Full-Stack Journey",
    role: "Foundations",
    description:
      "Focused on modern JavaScript, APIs, and database design while shipping my first complete products.",
  },
  {
    year: "2024",
    title: "Production Projects",
    role: "Engineering",
    description:
      "Built polished interfaces and backend services with performance and maintainability as first-class goals.",
  },
  {
    year: "2026",
    title: "Advanced Interactive Work",
    role: "Craft + Motion",
    description:
      "Delivering high-quality full-stack experiences with stronger motion design and storytelling through UI.",
  },
];

export default function CareerTimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });
  const rawDotPosition = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const dotPosition = useSpring(rawDotPosition, { stiffness: 110, damping: 25, mass: 0.4 });

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="career-timeline-section"
      aria-label="Career timeline"
    >
      <div className="career-timeline-bg-glow" aria-hidden="true" />
      <header className="career-timeline-heading">
        <h2>
          Career <span>Timeline</span>
        </h2>
      </header>

      <div className="career-timeline-grid">
        <div className="career-timeline-left">
          {TIMELINE_ITEMS.map((item, index) => (
            <article className={`career-left-item ${index === 1 ? "is-active" : ""}`} key={item.year}>
              <h3>{item.title}</h3>
              <p>{item.role}</p>
            </article>
          ))}
        </div>

        <div className="career-timeline-center">
          <div className="career-year-stack">
            {TIMELINE_ITEMS.map((item, index) => (
              <p className={`career-year ${index === 1 ? "is-active" : ""}`} key={item.year}>
                {item.year}
              </p>
            ))}
          </div>
          <div className="career-line">
            <motion.div className="career-line-fill" style={{ scaleY: smoothProgress }} />
            <motion.div className="career-line-dot" style={{ top: dotPosition }} />
          </div>
        </div>

        <div className="career-timeline-right">
          {TIMELINE_ITEMS.map((item, index) => (
            <p className={`career-right-copy ${index === 1 ? "is-active" : ""}`} key={item.year}>
              {item.description}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
