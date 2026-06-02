"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaAws,
  FaBootstrap,
  FaCss3Alt,
  FaDocker,
  FaFigma,
  FaGitAlt,
  FaGithub,
  FaHtml5,
  FaImage,
  FaJs,
  FaLinux,
  FaNodeJs,
  FaPython,
  FaReact,
} from "react-icons/fa";
import {
  FiBox,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiFeather,
  FiLayers,
  FiLayout,
  FiMonitor,
  FiSend,
  FiServer,
  FiTerminal,
  FiTool,
} from "react-icons/fi";
import { TbBrandOffice } from "react-icons/tb";

type TechItem = {
  name: string;
  icon: IconType;
};

const TECH_ROWS: TechItem[][] = [
  [
    { name: "Python", icon: FaPython },
    { name: "JavaScript", icon: FaJs },
    { name: "TypeScript", icon: FiCode },
    { name: "C", icon: FiCode },
    { name: "C++", icon: FiCode },
    { name: "Kotlin", icon: FiCode },
    { name: "HTML", icon: FaHtml5 },
    { name: "CSS", icon: FaCss3Alt },
    { name: "React", icon: FaReact },
    { name: "Next.js", icon: FiLayout },
    { name: "Bootstrap", icon: FaBootstrap },
  ],
  [
    { name: "Node.js", icon: FaNodeJs },
    { name: "Django", icon: FiServer },
    { name: "Flask", icon: FiFeather },
    { name: "FastAPI", icon: FiSend },
    { name: "TensorFlow", icon: FiCpu },
    { name: "PyTorch", icon: FiCpu },
    { name: "Scikit-learn", icon: FiTool },
    { name: "OpenCV", icon: FiMonitor },
    { name: "NumPy", icon: FiLayers },
    { name: "Tailwind", icon: FiLayers },
  ],
  [
    { name: "Pandas", icon: FiDatabase },
    { name: "MySQL", icon: FiDatabase },
    { name: "PostgreSQL", icon: FiDatabase },
    { name: "MongoDB", icon: FiDatabase },
    { name: "Firebase", icon: FiCloud },
    { name: "Redis", icon: FiDatabase },
    { name: "Docker", icon: FaDocker },
    { name: "Azure", icon: FiCloud },
  ],
  [
    { name: "Git", icon: FaGitAlt },
    { name: "GitHub", icon: FaGithub },
    { name: "Linux", icon: FaLinux },
    { name: "AWS", icon: FaAws },
    { name: "VS Code", icon: FiTerminal },
    { name: "Vercel", icon: FiBox },
  ],
  [
    { name: "Jupyter", icon: FiCode },
    { name: "Figma", icon: FaFigma },
    { name: "Postman", icon: FiSend },
    { name: "Photoshop", icon: FaImage },
  ],
  [
    { name: "Hugging Face", icon: FiCpu },
    { name: "MS Office", icon: TbBrandOffice },
  ],
];

export default function TechStackSection() {
  return (
    <section id="tech-stack" className="tech-stack-section" aria-label="My tech stack">
      <div className="tech-stack-glow" aria-hidden="true" />
      <div className="tech-stack-inner">
        <motion.h2
          className="tech-stack-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          TECH STACK
        </motion.h2>

        <div className="tech-stack-pyramid">
          {TECH_ROWS.map((row, rowIndex) => (
            <motion.div
              key={`row-${rowIndex}`}
              className="tech-stack-row"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.45,
                delay: rowIndex * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {row.map((tech) => (
                <motion.article
                  className="tech-stack-card"
                  key={tech.name}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 230, damping: 18 }}
                >
                  <span className="tech-stack-icon" aria-hidden="true">
                    <tech.icon />
                  </span>
                  <span className="tech-stack-name">{tech.name}</span>
                </motion.article>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
