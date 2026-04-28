// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./About.css";
import Footer from "../components/Footer"; // optional

const TEAM = [
  { name: "Cameron Bieker", role: "Co-founder & Lead Engineer", bio: "ChatGPT Prompt Engineer and Cursor Engineer" },
  { name: "Caye Lee", role: "CPO", bio: <strong><strong>Chief Party Officer</strong></strong> },
  { name: "Chloe Sooferan", role: "Co-founder & Creative director", bio: "Product strategist, former curator at major marketplaces." },
  { name: "Nikki Wu", role: "Co-founder & CFO", bio:"Makes big money moves" },
  // { name: "Cursor Lin", role: "Engineering Lead", bio: "Systems architect with 10+ years building secure platforms." },
  // { name: "Claude Park", role: "Design Lead", bio: "Visual & product designer; builds clear, accessible interfaces." },
];

const CREDIBILITY = [
  "Trusted verifications for primary and secondary markets",
  "Creator-friendly royalties and transparent provenance",
  "Enterprise-grade security and privacy practices",
];

export default function About() {
  return (
    <div className="about-page" role="main">
      <header className="about-hero">
        <div className="container">
          <h1 className="hero-title">Authentix</h1>
          <p className="hero-sub">
            We make authenticity visible. Our platform combines careful curation, verifiable provenance,
            and simple tools for creators so collectors can transact with confidence.
          </p>

          <div className="hero-meta" aria-hidden>
            <div className="kpi">
              <div className="kpi-number">12K+</div>
              <div className="kpi-label">Verified drops</div>
            </div>
            <div className="kpi">
              <div className="kpi-number">48K+</div>
              <div className="kpi-label">Active collectors</div>
            </div>
            <div className="kpi">
              <div className="kpi-number">99.99%</div>
              <div className="kpi-label">Integrity rate</div>
            </div>
          </div>
        </div>
      </header>

      <main className="about-content container" id="about-content">
        <section className="lead-card" aria-labelledby="mission-heading">
          <h2 id="mission-heading">Our mission</h2>
          <p className="lead-paragraph">
            To make ownership meaningful. We verify provenance, enforce creator-first economics,
            and surface context so collectors and creators build long-term value — not just transactions.
          </p>

          <ul className="credibility-list" aria-label="Why trust Authentix">
            {CREDIBILITY.map((c) => (
              <li key={c} className="cred-item">{c}</li>
            ))}
          </ul>
        </section>

        {/* --- Capabilities (replace existing capabilities block) --- */}
        <section className="capabilities" aria-labelledby="capabilities-heading">
        <h2 id="capabilities-heading">Capabilities</h2>

        <div className="capabilities-row">
            <article className="cap-card">
            <div className="cap-icon" aria-hidden>
                {/* small SVG glyph (shield) */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l7 3v6c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z" fill="currentColor" opacity="0.95"/>
                <path d="M10 11l2 2 4-4" stroke="#07121A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="cap-body">
                <h3>Verification</h3>
                <p>Multiple provenance sources and tamper-resistant records for clear chain-of-custody.</p>
            </div>
            </article>

            <article className="cap-card">
            <div className="cap-icon" aria-hidden>
                {/* small SVG glyph (diamond/creator) */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l4 6-4 6-4-6 4-6z" fill="currentColor" opacity="0.95"/>
                <path d="M4 20l4-8 4 8 4-8 4 8" stroke="#07121A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.12"/>
                </svg>
            </div>
            <div className="cap-body">
                <h3>Creator tools</h3>
                <p>Royalties, licensing and analytics that prioritize creator sustainability.</p>
            </div>
            </article>

            <article className="cap-card">
            <div className="cap-icon" aria-hidden>
                {/* small SVG glyph (shield+star for integrity) */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l7 3v6c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z" fill="currentColor" opacity="0.95"/>
                <circle cx="12" cy="11" r="1.6" fill="#07121A"/>
                <path d="M12 13v4" stroke="#07121A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="cap-body">
                <h3>Marketplace integrity</h3>
                <p>Curated drops, moderation workflows and policies to reduce fraud and protect buyers.</p>
            </div>
            </article>
        </div>
        </section>

        <section className="team-section" aria-labelledby="team-heading">
          <h2 id="team-heading">Leadership</h2>
          <div className="team-grid">
            {TEAM.map((m) => (
              <div key={m.name} className="team-card">
                <div className="team-text">
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                  <p className="team-bio">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="milestones" aria-labelledby="milestones-heading">
          <h2 id="milestones-heading">Milestones</h2>
          <ol>
            <li><strong>2021</strong> — Company founded to address provenance gaps in digital collections.</li>
            <li><strong>2022</strong> — Launched curated marketplace and first verification services.</li>
            <li><strong>2024</strong> — Rolled out creator royalties and enhanced verification tools.</li>
          </ol>
        </section>

        <section className="cta" aria-labelledby="contact-heading">
          <h3 id="contact-heading">Work with us</h3>
          <p>If you'd like to partner, collaborate, or learn more about our verification process, get in touch.</p>
          <Link className="cta-btn" to="/contact" role="button">Contact us</Link>
        </section>
      </main>

      {/* optional: show footer site-wide instead of per-page */}
      {/* <Footer /> */}
    </div>
  );
}