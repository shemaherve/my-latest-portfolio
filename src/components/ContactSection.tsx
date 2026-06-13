"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import officeImage from "../../office.jpg";

export default function ContactSection() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormState({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="contact-section" aria-label="Contact me">
      <div className="contact-inner">
        <motion.header
          className="contact-header"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>LET'S CONNECT</p>
          <h2>Contact</h2>
        </motion.header>

        <div className="contact-grid">
          {/* Left Column: Image with details */}
          <motion.div
            className="contact-info-col"
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="contact-image-wrap">
              <Image
                src={officeImage}
                alt="Office Space"
                className="contact-image"
                sizes="(max-width: 768px) 100vw, 50vw"
                placeholder="blur"
              />
              <div className="contact-image-overlay" />
            </div>

            <div className="contact-details">
              <div className="contact-detail-item">
                <FaEnvelope className="contact-detail-icon" />
                <div>
                  <h4>Email</h4>
                  <a href="mailto:dusabeshemaherve@gmail.com">dusabeshemaherve@gmail.com</a>
                </div>
              </div>

              <div className="contact-detail-item">
                <FaMapMarkerAlt className="contact-detail-icon" />
                <div>
                  <h4>Location</h4>
                  <p>Global / Remote</p>
                </div>
              </div>
            </div>

            <div className="contact-socials">
              <a
                href="https://github.com/redoyanul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="social-btn"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/in/redoyanul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-btn"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://instagram.com/redoyanul"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-btn"
              >
                <FaInstagram />
              </a>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            className="contact-form-col"
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="form-card">
              {submitted ? (
                <motion.div
                  className="form-success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. I'll get back to you as soon as possible.</p>
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h3>Send a Message</h3>
                  <p className="form-sub">Have a project or opportunity in mind? Let's discuss.</p>

                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="Your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Your message details..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="spinner" />
                    ) : (
                      <>
                        Send Message <FaPaperPlane className="send-icon" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
