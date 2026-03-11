import React from "react";
import "./Privacy.css";

export default function PrivacyPage() {
  return (
    <div className="privacy-root">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: March 2026</p>
        </header>

        <article className="privacy-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              We value your privacy. This policy explains what personal information we collect,
              how we use it, who we share it with, and the choices you can make about your data.
            </p>
          </section>

          <section>
            <h2>2. Information we collect</h2>
            <p>We collect information you provide directly and information collected automatically:</p>
            <ul>
              <li><strong>Account & profile data:</strong> name, email, profile information you submit.</li>
              <li><strong>Communications:</strong> messages you send to support or other users and related metadata.</li>
              <li><strong>Usage data:</strong> pages visited, features used, timestamps, and performance data.</li>
              <li><strong>Device & technical data:</strong> IP address, browser type, operating system, and cookies.</li>
            </ul>
          </section>

          <section>
            <h2>3. How we use your information</h2>
            <ul>
              <li>To provide, operate, and maintain our services.</li>
              <li>To respond to your requests, support inquiries, and communicate updates.</li>
              <li>To personalize and improve our product and user experience.</li>
              <li>To detect, prevent and address technical issues and abuse.</li>
            </ul>
          </section>

          <section>
            <h2>4. Sharing & disclosure</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul>
              <li><strong>Service providers:</strong> third-party vendors who perform services on our behalf (hosting, analytics, email delivery).</li>
              <li><strong>Legal reasons:</strong> to comply with legal processes, to protect rights, property or safety.</li>
              <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or asset sale.</li>
            </ul>
          </section>

          <section>
            <h2>5. Cookies & tracking</h2>
            <p>
              We use cookies and similar technologies to operate the site, remember your preferences,
              and for analytics. You can change cookie settings in your browser; disabling certain cookies
              may affect site functionality.
            </p>
          </section>

          <section>
            <h2>6. Your rights & choices</h2>
            <p>
              Depending on where you live, you may have rights to access, correct, or delete your data,
              to restrict or object to processing, and to receive a portable copy of your data. To exercise
              these rights, contact us at <a href="mailto:cayelee@usc.edu">cayelee@usc.edu</a>.
            </p>
          </section>

          <section>
            <h2>7. Data security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect personal
              information. However, no system is 100% secure — if you suspect a security problem, please contact us.
            </p>
          </section>

          <section>
            <h2>8. Retention</h2>
            <p>
              We retain your information for as long as necessary to provide services, comply with legal
              obligations, and resolve disputes. Retention periods vary by data type and purpose.
            </p>
          </section>

          <section>
            <h2>9. Children</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal information
              from children. If you believe we have collected data for a child, contact us and we will take steps to remove it.
            </p>
          </section>

          <section>
            <h2>10. Changes to this policy</h2>
            <p>
              We may update this policy. We will post the updated date at the top. For material changes,
              we will provide more prominent notice.
            </p>
          </section>

          <section>
            <h2>11. Contact us</h2>
            <p>
              If you have questions about this policy or want to exercise your rights, contact:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:cayelee@usc.edu">cayelee@usc.edu</a><br />
              <strong>Address:</strong> 13 Claude St, Los Angeles, CA, United States
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}