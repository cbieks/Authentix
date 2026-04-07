import React, { useState } from "react";
import "./Careers.css";

export default function CareersPage() {
  const [apply, setApply] = useState({ name: "", email: "", role: "", resume: "" });
  const [sent, setSent] = useState(null);

  function handleChange(e) {
    setApply((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Minimal client-side validation
    if (!apply.name || !apply.email || !apply.role) {
      setSent({ ok: false, msg: "Please fill name, email, and desired role." });
      return;
    }

    // This form is frontend only — replace fetch URL with your backend later
    setSent({ ok: null, msg: "Sending..." });
    setTimeout(() => {
      setSent({ ok: true, msg: "Thanks! Your application has been (pretend) submitted." });
      setApply({ name: "", email: "", role: "", resume: "" });
    }, 700);
  }

  return (
    <div className="careers-root">
      <div className="careers-card">
        <header className="careers-header">
          <h1>We're hiring</h1>
          <p className="subtitle">
            Join a tiny team that moves fast, drinks too much (coffee), and occasionally breaks into song.
          </p>
        </header>

        <section className="openings">
          <h2>Open roles</h2>

          <div className="role">
            <h3>Senior Frontend Engineer — UI Acrobat</h3>
            <p className="summary">
              Build delightful experiences, tame CSS monsters, and keep our components accessible and fast.
            </p>

            <ul className="requirements">
              <li>5+ years building production web apps (React/JS)</li>
              <li>Expert with CSS and animations — must not cause seizures</li>
              <li><strong>Bonus:</strong> able to do a backflip while debugging a cross-browser layout bug</li>
              <li><strong>Also bonus:</strong> can explain CSS specificity to a confused cat</li>
            </ul>

            <div className="perks">
              <strong>Perks:</strong> Flexible hours, remote-first, snacks, and absolutely crazy ragers.
            </div>
          </div>

          <div className="role">
            <h3>Full-Stack Engineer — Tap-dancing Tactician</h3>
            <p className="summary">Ship backend features, design APIs, and deploy with confidence.</p>

            <ul className="requirements">
              <li>Comfortable with Java, Node, or other backend stacks</li>
              <li>Strong fundamentals in testing, CI, and observability</li>
              <li><strong>Must</strong> be able to tap-dance while writing a unit test</li>
              <li>Comfort with data modeling and secure auth flows</li>
            </ul>
          </div>

          <div className="role">
            <h3>Product Designer — Pixel Whisperer</h3>
            <p className="summary">Design beautiful interfaces that people actually enjoy using.</p>

            <ul className="requirements">
              <li>Portfolio of product work, UX flows, and polished UI</li>
              <li>Prototyping skills (Figma, Framer, or similar)</li>
              <li><strong>Nice-to-have:</strong> juggling experience for design sprints</li>
            </ul>
          </div>

          <div className="role">
            <h3>Org Leader — Social Director (Chief Rager Recruiter)</h3>
            <p className="summary">
                We need someone who knows people. This is a high-energy org role focused on events,
                partnerships, and growing our crew.
            </p>

            <ul className="requirements">
                <li>Charismatic communicator — must be able to talk to people (the ones that exist on earth).</li>
                <li>Proven experience organizing events or leading student / community organizations.</li>
                <li>Hella clout: strong social network and the confidence to use it — we want people to show up.</li>
                <li>Excellent at sponsorship outreach, negotiating perks, and turning acquaintances into enthusiastic attendees.</li>
                <li>Reliable, organized, and able to manage logistics like permits, budgets, and late-night pizza orders.</li>
                <li><strong>Bonus (Required):</strong> Greek life (society's unspoken certification you're socially accepted)</li>
            </ul>

            <div className="perks">
                <strong>Perks:</strong> front-row access to every party, event budget, free merch, the undying gratitude of the team for socialization.
            </div>

            <div style={{ marginTop: 12 }}>
                <strong>How to apply:</strong> Email a one-paragraph pitch about your best party or event (and why you should run ours) to{" "}
                <a href="mailto:cayelee@usc.edu">cayelee@usc.edu</a> — bonus points for photos, links, or proof of chaos managed irresponsibly.
            </div>
          </div>
        </section>

        {/* <section className="fun-legal">
          <h2>Real talk</h2>
          <p>
            The above job requirements include playful exaggerations for fun. You do **not** actually have to be an acrobat,
            dancer, or circus performer to work here. We value skills, curiosity, and teamwork.
          </p>
        </section> */}

        <section className="apply">
          <h2>Apply</h2>
          <p>Prefer email? Send your resume and a sentence about why you’re a fit to <a href="mailto:cayelee@usc.edu">cayelee@usc.edu</a></p>

          <form className="apply-form" onSubmit={handleSubmit}>
            <input name="name" placeholder="Your name" value={apply.name} onChange={handleChange} />
            <input name="email" placeholder="Your email" value={apply.email} onChange={handleChange} />
            <input name="role" placeholder="Role you're applying for" value={apply.role} onChange={handleChange} />
            <input name="resume" placeholder="Resume link (Google Drive / Dropbox) or portfolio URL" value={apply.resume} onChange={handleChange} />
            <div className="apply-actions">
              <button type="submit" className="apply-btn">Apply — impress us</button>
            </div>
          </form>

          <div className="apply-status">
            {sent?.ok === true && <div className="ok">{sent.msg}</div>}
            {sent?.ok === false && <div className="bad">{sent.msg}</div>}
            {sent?.ok === null && <div className="pending">{sent.msg}</div>}
          </div>
        </section>

        <footer className="careers-footer">
          <small>
            We are committed to equal opportunity. If you require accommodations during the interview process,
            please email <a href="mailto:jobs@yourdomain.com">jobs@yourdomain.com</a>.
          </small>
        </footer>
      </div>
    </div>
  );
}