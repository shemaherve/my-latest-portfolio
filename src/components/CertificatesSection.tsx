"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import { useState, useEffect } from "react";

import vrImage from "../../left/vr.png";
import powerImage from "../../left/power.png";
import nvImage from "../../left/nv.jpeg";
import rainImage from "../../left/rain.jpeg";
import gameImage from "../../left/game.jpeg";
import iotImage from "../../left/iot.jpeg";

type CertificateItem = {
  id: string;
  source: string;
  title: string;
  description: string;
  role?: string;
  image: StaticImageData;
};

const CERTIFICATES: CertificateItem[] = [
  {
    id: "virtual-assistance",
    source: "ALX Africa",
    title: "Virtual Assistant Certificate",
    description: "Professional training in digital administrative support, executive assistance, remote workflow optimization, and digital tools.",
    image: vrImage,
  },
  {
    id: "power-bi",
    source: "Data Fair",
    title: "Power BI Certificate",
    description: "Advanced data visualization, business intelligence modeling, and interactive dashboard creation for data-driven decisions.",
    image: powerImage,
  },
  {
    id: "fullstack-developer",
    source: "Nova Service",
    title: "Full-Stack Developer Certificate",
    description: "Comprehensive full-stack engineering program covering client-side interfaces, server-side APIs, database management, and web applications.",
    image: nvImage,
  },
  {
    id: "rainguard-iot",
    source: "KOICA (Korea International Cooperation Agency)",
    title: "3rd Place - Rainguard IoT Competition",
    role: "Project Manager",
    description: "Awarded third place for leading the design, hardware orchestration, and project management of a smart rain-guard system.",
    image: rainImage,
  },
  {
    id: "game-development",
    source: "KOICA",
    title: "Certificate in Game Development",
    description: "Interactive programming, game mechanics design, asset integration, user flow logic, and building functional 2D challenge levels.",
    image: gameImage,
  },
  {
    id: "advanced-iot",
    source: "KOICA",
    title: "Advanced IoT Programming",
    description: "Embedded system architecture, microcontroller programming, sensor integration, real-time wireless telemetry, and data processing.",
    image: iotImage,
  },
];

export default function CertificatesSection() {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    if (!selectedCert) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCert(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCert]);

  return (
    <section id="certificates" className="certificates-section" aria-label="Certificates and achievements">
      <div className="certificates-inner">
        <motion.header
          className="certificates-header"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>CERTIFICATES</p>
          <h2>Proof</h2>
        </motion.header>

        <div className="certificates-grid">
          {CERTIFICATES.map((item, index) => (
            <motion.article
              className="certificate-card"
              key={item.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="certificate-image-container">
                <Image
                  src={item.image}
                  alt={item.title}
                  className="certificate-image"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  loading="lazy"
                />
                <button
                  type="button"
                  className="certificate-image-overlay"
                  aria-label={`Zoom ${item.title}`}
                  onClick={() => setSelectedCert(item)}
                >
                  <span className="zoom-text">Click to Zoom</span>
                </button>
              </div>
              <div className="certificate-copy">
                <p className="certificate-source">{item.source}</p>
                <h3>{item.title}</h3>
                {item.role && <p className="certificate-role">Role: {item.role}</p>}
                <p className="certificate-description">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCert && (
          <div
            className="cert-popup-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedCert.title} preview`}
            onClick={() => setSelectedCert(null)}
          >
            <motion.article
              className="cert-popup-card"
              onClick={(event) => event.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                className="cert-popup-close"
                aria-label="Close popup"
                onClick={() => setSelectedCert(null)}
              >
                ×
              </button>
              <div className="cert-popup-image-wrap">
                <Image
                  src={selectedCert.image}
                  alt={selectedCert.title}
                  width={1000}
                  height={680}
                  className="cert-popup-image"
                  priority
                />
              </div>
              <div className="cert-popup-copy">
                <p className="cert-popup-source">{selectedCert.source}</p>
                <h3>{selectedCert.title}</h3>
                {selectedCert.role && <p className="cert-popup-role">Role: {selectedCert.role}</p>}
                <p className="cert-popup-description">{selectedCert.description}</p>
              </div>
            </motion.article>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
