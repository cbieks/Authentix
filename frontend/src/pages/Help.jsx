import React, { useState } from "react";
import "./help.css";

const FAQS = [
  {
    id: 1,
    q: "How do I reset my password?",
    a: "Go to the login page and click 'Forgot password'. Enter your account email and follow the steps sent to your inbox.",
    category: "Account",
  },
  {
    id: 2,
    q: "How long does verification take?",
    a: "Verification typically takes 1-3 business days depending on workload and the documents you provide.",
    category: "Verification",
  },
  {
    id: 3,
    q: "Can I change my email address?",
    a: "Yes — go to your account settings → Email and follow the change-email flow. You will need to re-confirm the new address.",
    category: "Account",
  },
  {
    id: 4,
    q: "What documents are accepted for identity verification?",
    a: "We accept government-issued ID (passport, driver’s license) and proof of address (utility bill, bank statement). Check our verification page for full list.",
    category: "Verification",
  },
  {
    id: 5,
    q: "How do I report suspicious activity?",
    a: "Use the contact form below selecting 'Report' as the category and include screenshots or any relevant details.",
    category: "Security",
  },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", category: "General", priority: "Normal", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  const categories = ["General", "Account", "Verification", "Security", "Billing", "Report"];

  function filteredFaqs() {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }

  function toggle(id) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  function handleChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return "Please fill name, email and message.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Please enter a valid email.";
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
      // POST to your Java backend endpoint. Example: POST /api/support
      // The backend (Spring Boot or other Java framework) should accept JSON body matching the `form` shape.
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, ok: true, msg: data?.message || "Support request submitted." });
        setForm({ name: "", email: "", category: "General", priority: "Normal", subject: "", message: "" });
      } else {
        setStatus({ loading: false, ok: false, msg: data?.error || "Server error." });
      }
    } catch (err) {
      setStatus({ loading: false, ok: false, msg: "Network error." });
    }
  }

  return (
    <div className="help-page">
      <div className="help-container">
        <header className="help-header">
          <h1>Help Center</h1>
          <p>Find answers to common questions or contact our support team below.</p>
        </header>

        <div className="help-grid">
          <section className="faqs">
            <div className="faq-search">
              <input placeholder="Search FAQs" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>

            <div className="faq-list">
              {filteredFaqs().map((f) => (
                <div key={f.id} className={`faq-item ${activeId === f.id ? "open" : ""}`}>
                  <button className="faq-q" onClick={() => toggle(f.id)}>
                    <span>{f.q}</span>
                    <span className="chev">{activeId === f.id ? "−" : "+"}</span>
                  </button>
                  <div className="faq-a" aria-hidden={activeId !== f.id}>
                    <p>{f.a}</p>
                    <div className="faq-meta">Category: {f.category}</div>
                  </div>
                </div>
              ))}

              {filteredFaqs().length === 0 && <p className="no-results">No FAQs found.</p>}
            </div>
          </section>

          <aside className="support-form">
            <h2>Contact Support</h2>
            <p>Need more help? Submit a request and our support team will reach out.</p>

            <form onSubmit={handleSubmit} className="support-form-inner">
              <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
              <input name="email" type="email" placeholder="Your email" value={form.email} onChange={handleChange} required />

              <select name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>

              <input name="subject" placeholder="Subject (optional)" value={form.subject} onChange={handleChange} />

              <textarea name="message" placeholder="Describe your issue" rows={6} value={form.message} onChange={handleChange} required />

              <button type="submit" disabled={status.loading}>{status.loading ? "Sending..." : "Submit Request"}</button>

              {status.ok === true && <p className="success">{status.msg}</p>}
              {status.ok === false && <p className="error">{status.msg}</p>}
            </form>

            <div className="support-contact">
              <strong>Or email:</strong>
              <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>
            </div>
          </aside>
        </div>

        <footer className="help-footer">
          <p>Still stuck? You can also reach our team at <a href="tel:+1234567890">+1 (234) 567-890</a>.</p>
        </footer>
      </div>
    </div>
  );
}
