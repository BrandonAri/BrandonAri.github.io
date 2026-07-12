import { ProjectArchive } from "./project-archive";
import { Masthead } from "./masthead";

export default function Home() {
  return (
    <main id="top">
      <Masthead />

      <section className="experience-section" id="experience">
        <div className="page-shell">
          <header className="section-heading-stacked experience-heading">
            <h2>Academic &amp; professional development</h2>
            <p className="section-heading-meta">
              <span>Education &amp; Experience</span>
              <span>
                <a href="https://www.cbu.ca/" target="_blank" rel="noreferrer">
                  Cape Breton University
                </a>{" "}
                studies and professional work.
              </span>
            </p>
          </header>

          <div className="career-map" aria-label="Education and professional timeline">
            <div className="career-spine" aria-hidden="true">
              <span className="spine-node node-one" />
              <span className="spine-node node-two" />
              <span className="spine-node node-three" />
              <span className="spine-node node-four" />
            </div>

            <article className="path-card education-card">
              <div className="path-card-meta">
                <span>Academic path</span>
                <time>Ongoing</time>
              </div>
              <h3>
                <a href="https://www.cbu.ca/" target="_blank" rel="noreferrer">
                  Cape Breton University
                </a>
              </h3>
              <p className="path-role">
                Bachelor of Engineering Technology
                <br />
                Electronics &amp; Controls
              </p>
              <p className="path-description">
                Formal engineering-technology training built on electrical theory,
                circuit analysis, analog electronics, mathematics, physics,
                technical drawing, and shop practice.
              </p>

              <div className="course-foundation">
                <span>Completed technical foundation</span>
                <ul>
                  <li>Fundamentals of Electricity I &amp; II</li>
                  <li>Analog Electronic Circuits</li>
                  <li>Mathematics I &amp; II</li>
                  <li>Physics, drafting, and shop practice</li>
                </ul>
              </div>

              <details className="program-pathway">
                <summary>View the Electronics &amp; Controls program pathway</summary>
                <div>
                  <p>
                    Linear Integrated Circuits · Signals &amp; Controls · Industrial
                    Electronic Circuits · Machines &amp; Controls · Programmable Logic
                    Controllers · Process Measurements · Process Controls · Pulse &amp;
                    Digital Circuits · Embedded Operating Systems · Digital Signal
                    Processing · Microelectronic Design Tools · Applied Integrated
                    Circuit Systems
                  </p>
                  <small>
                    Program pathway shown separately from completed coursework.
                  </small>
                </div>
              </details>
            </article>

            <article className="path-card internship-card work-branch">
              <div className="path-card-meta">
                <span>
                  <a href="https://syntaxis.digital/" target="_blank" rel="noreferrer">
                    Syntaxis Ltd.
                  </a>
                </span>
                <time>Nov 2025 — Apr 2026</time>
              </div>
              <h3>Applied Engineering Intern</h3>
              <p className="path-role">Electronics &amp; Software</p>
              <ul className="role-points">
                <li>
                  Worked with the engineering team on Sila product development and
                  hardware-related application integration.
                </li>
                <li>
                  Prototyped ways to use iPhone and Apple Watch sensors, including
                  accelerometer data, inside the application experience.
                </li>
                <li>
                  Supported hardware optimization, device APIs, and in-app AI
                  development.
                </li>
              </ul>
            </article>

            <article className="path-card current-card work-branch">
              <div className="path-card-meta">
                <span>
                  <a href="https://syntaxis.digital/" target="_blank" rel="noreferrer">
                    Syntaxis Ltd.
                  </a>{" "}
                  · Hardware
                </span>
                <time>Apr 30, 2026 — Present</time>
              </div>
              <div className="current-status">Full-time</div>
              <h3>Hardware Development &amp; Product Management</h3>
              <p className="path-role">Sila product implementation</p>
              <p className="path-description">
                Promoted into a full-time role spanning hardware implementation and
                product management for Sila.
              </p>
              <div className="active-development">
                <span>Active hardware program</span>
                <h4>Compact multipurpose measurement device</h4>
                <p>
                  Developing the working prototype around an nRF52840 main board.
                  The current design targets a 5 kg load capacity, a compact premium
                  enclosure, magnetic phone attachment, wireless charging, and wired
                  USB-C Power Delivery charging and power-bank functions.
                </p>
                <dl>
                  <div>
                    <dt>Controller</dt>
                    <dd>nRF52840</dd>
                  </div>
                  <div>
                    <dt>Capacity target</dt>
                    <dd>5 kg</dd>
                  </div>
                  <div>
                    <dt>Integration</dt>
                    <dd>Magnetic phone attachment</dd>
                  </div>
                  <div>
                    <dt>Power</dt>
                    <dd>Wireless + USB-C PD</dd>
                  </div>
                </dl>
              </div>
            </article>

            <aside className="volunteer-branch path-card">
              <div className="path-card-meta">
                <span>Community</span>
                <time>Jul 2026</time>
              </div>
              <h3>Rotary Ribfest</h3>
              <p>Event volunteer · Cape Breton</p>
            </aside>
          </div>
        </div>
      </section>

      <ProjectArchive />

      <section className="contact-section" id="contact">
        <div className="page-shell contact-inner">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Let&apos;s discuss the work.</h2>
          </div>
          <div className="contact-copy">
            <p>
              For engineering opportunities, hardware development, product work,
              or collaboration, contact me directly by email.
            </p>
            <a href="mailto:xz1919810@gmail.com">
              <span>Personal</span>
              <strong>xz1919810@gmail.com</strong>
              <i aria-hidden="true">↗</i>
            </a>
            <a href="mailto:brandon@syntaxis.digital">
              <span>Syntaxis</span>
              <strong>brandon@syntaxis.digital</strong>
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-shell">
          <div>
            <strong>Brandon Chen</strong>
            <span>Electronics &amp; Controls</span>
          </div>
          <p>
            <a href="https://www.cbu.ca/" target="_blank" rel="noreferrer">
              Cape Breton University
            </a>{" "}
            ·{" "}
            <a href="https://syntaxis.digital/" target="_blank" rel="noreferrer">
              Syntaxis Ltd.
            </a>
          </p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
