import React, { useState } from "react";
import "./contact.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return "Please fill name, email and message.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return "Please enter a valid email.";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ loading: false, ok: false, msg: err });
      return;
    }
    setStatus({ loading: true, ok: null, msg: "" });

    try {
      // Default POST target - replace with your Java backend endpoint later
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, ok: true, msg: data?.message || "Message sent." });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ loading: false, ok: false, msg: data?.error || "Server error." });
      }
    } catch (err) {
      setStatus({ loading: false, ok: false, msg: "Network error." });
    }
  }

  return (
    <div className="contact-page-root">
      <div className="contact-main">
        <section className="contact-inner">
          <div className="contact-left">
            <h1>Get in Touch</h1>
            <p className="lead">
              Questions, partnerships, or verification inquiries — send a message and we’ll respond within a few business days.
            </p>

            <div className="contact-details">
              <div className="detail">
                <div className="label">Email</div>
                <div className="value">cayelee@usc.edu</div>
              </div>

              <div className="detail">
                <div className="label">Location</div>
                <div className="value">Los Angeles, CA</div>
              </div>

              <div className="detail">
                <div className="label">Hours</div>
                <div className="value">Mon–Fri, 9am–5pm PT</div>
              </div>
            </div>
          </div>

          <aside className="contact-right">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="row two">
                <input
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  aria-label="Your name"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={handleChange}
                  aria-label="Your email"
                />
              </div>

              <input
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                rows="6"
              />

              <div className="actions">
                <button type="submit" className="btn-primary" disabled={status.loading}>
                  {status.loading ? "Sending…" : "Send Message"}
                </button>
              </div>

              <div className="status">
                {status.ok === true && <div className="success">{status.msg}</div>}
                {status.ok === false && <div className="error">{status.msg}</div>}
              </div>
            </form>
          </aside>
        </section>
      </div>
    </div>
  );
}