import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="brand">
            <div className="logo-mark" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.2" />
                <path d="M7 13.5c1.5 0 2.5-2.5 5-2.5s3.5 2.5 5 2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="brand-copy">
              <h3 className="brand-title">Authentix</h3>
              <p className="brand-sub">Discover. Verify. Own.</p>

              <p className="brand-desc">
                Hand-picked NFTs, collectibles and drops. Built with trust-first verification so you can buy and sell with confidence.
              </p>

              <div className="brand-actions">
                <Link className="btn-primary" to="/register">Get started</Link>
                <Link className="link-muted" to="/explore">Browse all</Link>
              </div>
            </div>
          </div>

          <div className="links-grid" aria-hidden={false}>
            <div className="link-column">
              <h4>Marketplace</h4>
              <ul>
                <li><Link to="/explore">Explore</Link></li>
                {/* <li><a href="#">Drops</a></li>
                <li><a href="#">Brands</a></li> */}
              </ul>
            </div>

            <div className="link-column">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><a href="/press">Press</a></li>
              </ul>
            </div>

            <div className="link-column">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="newsletter">
            <h4>Stay in the loop</h4>
            <p className="muted">Sign up for curated drops and early access.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // placeholder: wire this up to your API or email provider
                const email = e.target.elements["email"].value;
                alert(`Thanks — we would have sent a signup for: ${email}`);
                e.target.reset();
              }}
              className="newsletter-form"
            >
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input id="footer-email" name="email" type="email" placeholder="Your email" required />
              <button type="submit">Join</button>
            </form>

            <div className="social">
              <a aria-label="Twitter" href="#" className="social-btn"> {/* svg */ }
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 19c7.333 0 11.333-6 11.333-11.2v-.51A8.048 8.048 0 0022 4.64a7.748 7.748 0 01-2.2.61 3.852 3.852 0 001.7-2.14 7.718 7.718 0 01-2.44.93A3.867 3.867 0 0015.5 3c-2.13 0-3.86 1.76-3.86 3.93 0 .31.04.62.1.91A11 11 0 013 4.92a3.9 3.9 0 00-.52 1.97c0 1.36.7 2.56 1.76 3.27A3.86 3.86 0 012.8 10v.05c0 1.9 1.4 3.49 3.25 3.86a3.8 3.8 0 01-1.02.13c-.25 0-.5-.02-.73-.07.5 1.56 1.96 2.69 3.69 2.72A7.76 7.76 0 012 18.4 11 11 0 008 19" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a aria-label="Instagram" href="#" className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="0.8"/><path d="M8.5 12.2a3.5 3.5 0 106.99-.02 3.5 3.5 0 00-6.99.02z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.8 6.2h.01" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
              </a>
              {/* <a aria-label="Discord" href="#" className="social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.5 14.5s.9-1.2 2.6-1.2 2.6 1.2 2.6 1.2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><path d="M20 4s-1.6 1.4-3.6 1.9C14.4 6.4 12.3 6 12 6s-2.4.4-4.4.1C5.6 5.4 4 4 4 4s1.6 3.2 2.1 5.3c.2.7.5 1.6.9 2.3C7.8 13 10.1 14 12 14s4.2-1 4.9-2.5c.4-.7.7-1.6.9-2.3C18.4 7.2 20 4 20 4z" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a> */}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Authentix. All rights reserved.</p>
          <p>Made with minimal typos and the 5 ultimate C's (Cameron, Caye, Cursor, Claude, ChatGPT)</p>
          <div className="legal-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}