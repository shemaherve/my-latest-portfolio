"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import agaImage from "../../aga.png";
import artiImage from "../../Arti.png";
import benmImage from "../../benm.png";
import kataAiImage from "../../kata Ai.png";
import schImage from "../../sch.png";
import boboAdminImage from "../../image.png";
import boboPanelImage from "../../boboadmin.png";
import bennnImage from "../../bennn.png";
import smartImage from "../../smart.png";

type WorkProject = {
  id: string;
  number: string;
  title: string;
  category: string;
  stack: string;
  image: StaticImageData;
  summary: string;
  visitUrl?: string;
};

const PROJECTS: WorkProject[] = [
  {
    id: "agaseke-wallet",
    number: "01",
    title: "Agaseke Wallet",
    category: "Fintech / Student Savings",
    stack: "Next.js, React, Node.js, API integrations",
    image: agaImage,
    summary: "A student-focused wallet platform that helps learners save money online in a simple way.",
  },
  {
    id: "artist-portfolio",
    number: "02",
    title: "Artist Portfolio",
    category: "Creative Web",
    stack: "React, Framer Motion, Responsive UI",
    image: artiImage,
    summary: "A portfolio website for artists to present projects, identity, and visual storytelling.",
    visitUrl: "https://fredpotfolio.vercel.app/",
  },
  {
    id: "ben-church",
    number: "03",
    title: "Big Evangelical Network",
    category: "Ministry Website",
    stack: "Next.js, CMS-ready content, SEO",
    image: benmImage,
    summary: "The public website for Big Evangelical Network Ministry Church and community communication.",
    visitUrl: "http://bigevangelicalnetwork.org/",
  },
  {
    id: "kata-ai",
    number: "04",
    title: "Kata AI",
    category: "AI Tooling",
    stack: "Image processing, AI inference, web app",
    image: kataAiImage,
    summary: "An AI tool that removes image backgrounds quickly for creators and product teams.",
  },
  {
    id: "gihanga-student",
    number: "05",
    title: "Gihanga Student Dashboard",
    category: "E-learning Platform",
    stack: "Dashboard UX, role-based data views",
    image: schImage,
    summary: "A student dashboard for Gihanga E-learning that supports online learning and progress tracking.",
    visitUrl: "http://tsmskills.vercel.app/",
  },
  {
    id: "bobo250-shop-admin",
    number: "06",
    title: "Bobo250 Admin",
    category: "E-commerce",
    stack: "Admin tools, product flow, orders",
    image: boboAdminImage,
    summary: "An e-commerce administration system that helps people manage products and online buying flow.",
    visitUrl: "http://bobo250.vercel.app/",
  },
  {
    id: "bobo250-panel",
    number: "07",
    title: "Bobo250 Admin Panel",
    category: "Management Dashboard",
    stack: "Analytics, inventory, secure admin routes",
    image: boboPanelImage,
    summary: "A dedicated admin dashboard that helps Bobo250 manage products and platform operations.",
  },
  {
    id: "ben-admin",
    number: "08",
    title: "BEN Ministry Admin",
    category: "Organization Dashboard",
    stack: "Content control, announcements, user roles",
    image: bennnImage,
    summary: "An administration dashboard for Big Evangelical Network Ministry to manage content and updates.",
    visitUrl: "https://www.bigevangelicalnetwork.org/admin",
  },
  {
    id: "smartride-rwanda",
    number: "09",
    title: "SmartRide Rwanda",
    category: "Transport Ticketing",
    stack: "Online booking, ticketing system, payments",
    image: smartImage,
    summary: "A system that helps people buy transport tickets online with a faster booking experience.",
  },
];

export default function WorkShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Left-moving wrapper animation that advances as the section scrolls.
  const rawX = useTransform(scrollYProgress, [0, 1], ["0%", "-82%"]);
  const trackX = useSpring(rawX, { stiffness: 95, damping: 26, mass: 0.35 });

  useEffect(() => {
    if (!selectedProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProject]);

  return (
    <section id="work" ref={sectionRef} className="work-showcase-section" aria-label="My work showcase">
      <div className="work-showcase-sticky">
        <header className="work-showcase-header">
          <h2>
            About My <span>Work</span>
          </h2>
        </header>

        <div className="work-showcase-viewport">
          <motion.div className="work-showcase-track" style={{ x: trackX }}>
            {PROJECTS.map((project) => (
              <article className="work-card" key={project.id}>
                <div className="work-card-top">
                  <p className="work-index">{project.number}</p>
                  <div className="work-title-wrap">
                    <h3>{project.title}</h3>
                    <p>{project.category}</p>
                  </div>
                </div>

                <div className="work-card-meta">
                  <h4>Tools and features</h4>
                  <p>{project.stack}</p>
                </div>

                <div className="work-image-wrap">
                  <button
                    type="button"
                    className="work-image-button"
                    aria-label={`Open ${project.title} image`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={320}
                      height={320}
                      className="work-project-image"
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 60vw, 30vw"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.classList.add("is-missing");
                      }}
                    />
                  </button>
                </div>

                <p className="work-summary">{project.summary}</p>

                {project.visitUrl && (
                  <div className="work-visit-container">
                    <a
                      href={project.visitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="work-visit-btn"
                    >
                      Visit Project <span className="visit-arrow">↗</span>
                    </a>
                  </div>
                )}
              </article>
            ))}
          </motion.div>
        </div>
      </div>

      {selectedProject && (
        <div
          className="work-popup-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} preview`}
          onClick={() => setSelectedProject(null)}
        >
          <article className="work-popup-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="work-popup-close"
              aria-label="Close popup"
              onClick={() => setSelectedProject(null)}
            >
              ×
            </button>
            <div className="work-popup-image-wrap">
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                width={1200}
                height={720}
                className="work-popup-image"
                priority
              />
            </div>
            <div className="work-popup-copy">
              <h3>{selectedProject.title}</h3>
              <p>{selectedProject.summary}</p>
              {selectedProject.visitUrl && (
                <div className="work-popup-visit-container">
                  <a
                    href={selectedProject.visitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="work-visit-btn"
                  >
                    Visit Website <span className="visit-arrow">↗</span>
                  </a>
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
