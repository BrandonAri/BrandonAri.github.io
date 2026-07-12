const media = "/media";

type FlowStep = {
  title: string;
  detail: string;
};

function FlowDiagram({ label, steps }: { label: string; steps: FlowStep[] }) {
  return (
    <figure className="diagram" aria-label={label}>
      <figcaption>{label}</figcaption>
      <div className="diagram-flow">
        {steps.map((step, index) => (
          <div className="diagram-step" key={step.title}>
            <div className="diagram-node">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </div>
            {index < steps.length - 1 ? (
              <span className="diagram-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </figure>
  );
}

function ProjectField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="project-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="identity" href="#top" aria-label="Brandon Chen, home">
          <strong>Brandon Chen</strong>
          <span>Electronics &amp; Controls</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#projects">Projects</a>
          <a href="#methods">Methods</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="intro page-shell">
        <div className="intro-main">
          <p className="kicker">Engineering technology portfolio / 2026</p>
          <h1>Brandon Chen</h1>
          <p className="credential">
            Bachelor of Engineering Technology — Electronics &amp; Controls
            <br />
            Cape Breton University
          </p>
          <p className="intro-summary">
            I work on embedded controls, electronics diagnostics, hardware
            integration, and digital motion systems. This portfolio documents the
            problem, architecture, implementation, verification, and revisions for
            each project.
          </p>
          <a className="primary-link" href="#projects">
            Review selected projects <span aria-hidden="true">↓</span>
          </a>
        </div>

        <aside className="intro-record" aria-label="Portfolio summary">
          <div>
            <span>Education</span>
            <strong>B.Eng.Tech.</strong>
            <p>Electronics &amp; Controls</p>
          </div>
          <div>
            <span>Current focus</span>
            <strong>Embedded systems</strong>
            <p>Control, measurement, and integration</p>
          </div>
          <div>
            <span>Documentation standard</span>
            <strong>Evidence first</strong>
            <p>No unrecorded values or invented performance claims</p>
          </div>
        </aside>
      </section>

      <section className="project-register page-shell" id="projects">
        <header className="section-title">
          <div>
            <p className="kicker">Selected engineering work</p>
            <h2>Project register</h2>
          </div>
          <p>
            Three projects documented from requirements through verification. Open
            any record to jump to the complete case study.
          </p>
        </header>

        <div className="register-table" role="list">
          <div className="register-head" aria-hidden="true">
            <span>ID</span>
            <span>Project</span>
            <span>Domain</span>
            <span>Evidence</span>
          </div>
          <a className="register-row" href="#smartify" role="listitem">
            <span>P-01</span>
            <strong>Smartify appliance retrofit</strong>
            <span>Embedded control</span>
            <span>Hardware + 2 videos</span>
          </a>
          <a className="register-row" href="#vehicle" role="listitem">
            <span>P-02</span>
            <strong>Vehicle electrical teardown</strong>
            <span>Automotive electronics</span>
            <span>Teardown + repair video</span>
          </a>
          <a className="register-row" href="#motion" role="listitem">
            <span>P-03</span>
            <strong>Controllable movement study</strong>
            <span>Digital motion system</span>
            <span>Rig + sequence record</span>
          </a>
        </div>
      </section>

      <article className="project page-shell" id="smartify">
        <header className="project-header">
          <div className="project-id">
            <span>Project P-01</span>
            <span>Embedded control</span>
          </div>
          <div className="project-heading">
            <h2>Smartify appliance retrofit</h2>
            <p>
              Adding a configurable ESP32 control path to an existing appliance
              without replacing the original control electronics.
            </p>
          </div>
        </header>

        <dl className="project-brief">
          <ProjectField label="Problem">
            Add remote control while keeping the existing front-panel functions and
            avoiding a redesign of the mains-voltage board.
          </ProjectField>
          <ProjectField label="Constraints">
            Limited enclosure space, proximity to a blower, existing wiring, safe
            separation, and future service access.
          </ProjectField>
          <ProjectField label="Result">
            Working Wi-Fi-to-IR retrofit documented through installation photos,
            configuration recording, and live-operation recording.
          </ProjectField>
        </dl>

        <figure className="project-cover">
          <img
            src={`${media}/smartify-open-chassis.jpeg`}
            alt="Open appliance chassis showing the fan, original control board, wiring, and added electronics"
          />
          <figcaption>
            <span>Build state: integration</span>
            <span>Original controller retained</span>
          </figcaption>
        </figure>

        <section className="technical-section">
          <header className="technical-heading">
            <span>01</span>
            <div>
              <p>System definition</p>
              <h3>Architecture and scope</h3>
            </div>
          </header>
          <div className="technical-body">
            <DiagramWithNote
              label="Command path"
              steps={[
                { title: "Setup interface", detail: "Local configuration" },
                { title: "ESP32", detail: "Wi-Fi control layer" },
                { title: "IR interface", detail: "Command signal" },
                { title: "OEM controller", detail: "Original machine logic" },
              ]}
              note="The added low-voltage control path sends commands into the existing interface. Original power switching remains on the appliance controller."
            />
          </div>
        </section>

        <section className="technical-section">
          <header className="technical-heading">
            <span>02</span>
            <div>
              <p>Personal contribution</p>
              <h3>What I designed and built</h3>
            </div>
          </header>
          <div className="technical-body contribution-grid">
            <ul className="work-list">
              <li>Defined the ESP32-to-IR control path.</li>
              <li>Configured the controller and local setup workflow.</li>
              <li>Connected the IR interface to the original receiver path.</li>
              <li>Planned board position and cable routing inside the enclosure.</li>
              <li>Insulated the added electronics and checked moving-part clearance.</li>
              <li>Modified the enclosure for routing and service access.</li>
            </ul>
            <figure className="detail-image">
              <img
                src={`${media}/smartify-ir-board.jpeg`}
                alt="Close view of the original infrared receiver board connected to the new controller"
              />
              <figcaption>IR receiver interface / low-voltage connection</figcaption>
            </figure>
          </div>
        </section>

        <section className="technical-section">
          <header className="technical-heading">
            <span>03</span>
            <div>
              <p>Build evidence</p>
              <h3>Physical integration</h3>
            </div>
          </header>
          <div className="technical-body evidence-list">
            <figure>
              <img
                src={`${media}/smartify-esp32-installed.jpeg`}
                alt="ESP32 controller installed and insulated inside the appliance"
              />
              <figcaption>
                <strong>Controller installation</strong>
                <span>Board protected and positioned away from the fan path.</span>
              </figcaption>
            </figure>
            <figure>
              <img
                src={`${media}/smartify-cable-routing.jpeg`}
                alt="Cable routing inside the appliance enclosure"
              />
              <figcaption>
                <strong>Cable routing</strong>
                <span>Signal and supply leads grouped for clearance and service.</span>
              </figcaption>
            </figure>
            <figure>
              <img
                src={`${media}/smartify-enclosure-cut.jpeg`}
                alt="Rotary cutting tool creating an access opening in the appliance enclosure"
              />
              <figcaption>
                <strong>Enclosure revision</strong>
                <span>Access opening added after the first routing plan proved tight.</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="technical-section">
          <header className="technical-heading">
            <span>04</span>
            <div>
              <p>Verification</p>
              <h3>Test record</h3>
            </div>
          </header>
          <div className="technical-body">
            <div className="data-table" role="table" aria-label="Smartify test record">
              <div className="data-head" role="row">
                <span role="columnheader">Check</span>
                <span role="columnheader">Method</span>
                <span role="columnheader">Recorded evidence</span>
                <span role="columnheader">Status</span>
              </div>
              <div className="data-row" role="row">
                <span role="cell">Configuration path</span>
                <span role="cell">Complete local setup walkthrough</span>
                <span role="cell">60.1 s screen recording</span>
                <span role="cell" className="status-pass">Documented</span>
              </div>
              <div className="data-row" role="row">
                <span role="cell">Command path</span>
                <span role="cell">Wi-Fi command to appliance response</span>
                <span role="cell">24.4 s live demonstration</span>
                <span role="cell" className="status-pass">Functional</span>
              </div>
              <div className="data-row" role="row">
                <span role="cell">Installation</span>
                <span role="cell">Visual routing, insulation, and clearance check</span>
                <span role="cell">Final build photographs</span>
                <span role="cell" className="status-pass">Checked</span>
              </div>
            </div>

            <div className="verification-media">
              <figure className="video-record">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={`${media}/smartify-demo-poster.jpeg`}
                >
                  <source src={`${media}/smartify-demo.mp4`} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
                <figcaption>Live operation / 00:24</figcaption>
              </figure>
              <figure className="video-record">
                <video controls playsInline preload="metadata">
                  <source src={`${media}/smartify-config.mp4`} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
                <figcaption>Configuration record / 01:00</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="technical-section revision-section">
          <header className="technical-heading">
            <span>05</span>
            <div>
              <p>Revision log</p>
              <h3>What changed after the first build</h3>
            </div>
          </header>
          <div className="technical-body">
            <div className="revision-log">
              <div>
                <span>R1</span>
                <strong>Issue</strong>
                <p>Controller and leads were crowded near the blower area.</p>
              </div>
              <div>
                <span>R2</span>
                <strong>Change</strong>
                <p>Grouped and insulated the added board and rerouted loose leads.</p>
              </div>
              <div>
                <span>R3</span>
                <strong>Reason</strong>
                <p>Improve moving-part clearance, protection, and serviceability.</p>
              </div>
            </div>
          </div>
        </section>
      </article>

      <article className="project page-shell" id="vehicle">
        <header className="project-header">
          <div className="project-id">
            <span>Project P-02</span>
            <span>Automotive electronics</span>
          </div>
          <div className="project-heading">
            <h2>Vehicle electrical teardown</h2>
            <p>
              A controlled service workflow for reaching, inspecting, and restoring
              an electrical path behind vehicle interior panels.
            </p>
          </div>
        </header>

        <dl className="project-brief">
          <ProjectField label="Problem">
            Reach a concealed electrical path without damaging trim, fasteners,
            harness connectors, or adjacent vehicle systems.
          </ProjectField>
          <ProjectField label="Constraints">
            Hidden routing, staged panel access, stored restraint components,
            battery isolation, and reliable reassembly.
          </ProjectField>
          <ProjectField label="Result">
            A documented sequence covering safe isolation, teardown, harness access,
            inspection, reassembly, and functional verification.
          </ProjectField>
        </dl>

        <figure className="project-cover vehicle-cover">
          <img
            src={`${media}/vehicle-panel-teardown.jpeg`}
            alt="Vehicle interior with side trim removed to expose body wiring and connectors"
          />
          <figcaption>
            <span>Build state: harness access</span>
            <span>Trim and side panel removed</span>
          </figcaption>
        </figure>

        <section className="technical-section">
          <header className="technical-heading">
            <span>01</span>
            <div>
              <p>System definition</p>
              <h3>Diagnostic path</h3>
            </div>
          </header>
          <div className="technical-body">
            <DiagramWithNote
              label="Electrical service path"
              steps={[
                { title: "12 V supply", detail: "Battery isolation" },
                { title: "Protection", detail: "Fuse and feed" },
                { title: "Body harness", detail: "Routing and connectors" },
                { title: "Load / module", detail: "Functional check" },
              ]}
              note="The inspection followed the electrical path while the physical teardown followed the safest available access path. Those two paths were documented separately."
            />
          </div>
        </section>

        <section className="technical-section">
          <header className="technical-heading">
            <span>02</span>
            <div>
              <p>Personal contribution</p>
              <h3>Service and verification work</h3>
            </div>
          </header>
          <div className="technical-body contribution-grid">
            <ul className="work-list">
              <li>Isolated the battery before interior electrical work.</li>
              <li>Documented the panel and fastener removal sequence.</li>
              <li>Removed trim and seating components for safe access.</li>
              <li>Photographed harness routing before disconnecting components.</li>
              <li>Inspected and restored connector seating.</li>
              <li>Completed controlled power-up and functional checks.</li>
            </ul>
            <figure className="detail-image">
              <img
                src={`${media}/car-rear-seat-teardown.jpeg`}
                alt="Vehicle rear seating area disassembled to reach wiring and components"
              />
              <figcaption>Expanded access after the first panel proved insufficient</figcaption>
            </figure>
          </div>
        </section>

        <section className="technical-section">
          <header className="technical-heading">
            <span>03</span>
            <div>
              <p>Verification and revision</p>
              <h3>Access plan changed before force was applied</h3>
            </div>
          </header>
          <div className="technical-body split-record">
            <div>
              <div className="data-table compact-table" role="table" aria-label="Vehicle service checks">
                <div className="data-head" role="row">
                  <span role="columnheader">Check</span>
                  <span role="columnheader">Evidence</span>
                  <span role="columnheader">Status</span>
                </div>
                <div className="data-row" role="row">
                  <span role="cell">Supply isolation</span>
                  <span role="cell">Battery service setup</span>
                  <span role="cell" className="status-pass">Complete</span>
                </div>
                <div className="data-row" role="row">
                  <span role="cell">Harness access</span>
                  <span role="cell">Teardown photographs</span>
                  <span role="cell" className="status-pass">Complete</span>
                </div>
                <div className="data-row" role="row">
                  <span role="cell">Repair sequence</span>
                  <span role="cell">84.0 s service record</span>
                  <span role="cell" className="status-pass">Documented</span>
                </div>
              </div>
              <div className="revision-note">
                <strong>Revision</strong>
                <p>
                  Initial trim access did not expose enough of the harness. The
                  sequence was expanded to remove the rear seating and adjacent
                  panels in order, avoiding forced access and improving reassembly
                  confidence.
                </p>
              </div>
            </div>
            <figure className="video-record vehicle-video">
              <video
                controls
                playsInline
                preload="metadata"
                poster={`${media}/car-repair-poster.jpeg`}
              >
                <source src={`${media}/car-repair.mp4`} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
              <figcaption>Repair record / 01:24</figcaption>
            </figure>
          </div>
        </section>
      </article>

      <article className="project page-shell" id="motion">
        <header className="project-header">
          <div className="project-id">
            <span>Project P-03</span>
            <span>Digital motion system</span>
          </div>
          <div className="project-heading">
            <h2>Controllable movement study</h2>
            <p>
              A squat sequence in Unreal Engine organized into editable character,
              rig, timing, and camera layers for frame-by-frame review.
            </p>
          </div>
        </header>

        <dl className="project-brief">
          <ProjectField label="Problem">
            Make body position and timing inspectable instead of relying on one
            baked animation that is difficult to revise.
          </ProjectField>
          <ProjectField label="Constraints">
            Joint continuity, visible weight transfer, phase timing, camera
            readability, and editable track organization.
          </ProjectField>
          <ProjectField label="Result">
            A sequenced motion study with independent character controls, timed
            movement phases, and camera review.
          </ProjectField>
        </dl>

        <figure className="project-cover motion-cover">
          <img
            src={`${media}/unreal-motion-system.jpeg`}
            alt="Unreal Engine showing a digital athlete performing a squat with rig and sequence tracks visible"
          />
          <figcaption>
            <span>Build state: sequence review</span>
            <span>Rig, transform, and camera tracks visible</span>
          </figcaption>
        </figure>

        <section className="technical-section">
          <header className="technical-heading">
            <span>01</span>
            <div>
              <p>System definition</p>
              <h3>Motion architecture</h3>
            </div>
          </header>
          <div className="technical-body">
            <DiagramWithNote
              label="Motion review path"
              steps={[
                { title: "Reference", detail: "Physical movement" },
                { title: "Character rig", detail: "Editable controls" },
                { title: "Sequencer", detail: "Phase timing" },
                { title: "Review output", detail: "Camera playback" },
              ]}
              note="The model, control rig, sequence timing, and camera remain separate so a problem can be corrected without rebuilding the entire scene."
            />
          </div>
        </section>

        <section className="technical-section">
          <header className="technical-heading">
            <span>02</span>
            <div>
              <p>Test and revision</p>
              <h3>Pose accuracy was not enough</h3>
            </div>
          </header>
          <div className="technical-body">
            <div className="data-table" role="table" aria-label="Motion study review record">
              <div className="data-head" role="row">
                <span role="columnheader">Review</span>
                <span role="columnheader">Method</span>
                <span role="columnheader">Finding</span>
                <span role="columnheader">Revision</span>
              </div>
              <div className="data-row" role="row">
                <span role="cell">Phase timing</span>
                <span role="cell">Frame-by-frame playback</span>
                <span role="cell">Initial timing appeared mechanically even</span>
                <span role="cell">Separated setup, descent, transition, and drive</span>
              </div>
              <div className="data-row" role="row">
                <span role="cell">Joint position</span>
                <span role="cell">Rig control review</span>
                <span role="cell">Pose continuity needed tuning between keys</span>
                <span role="cell">Adjusted intermediate controls and key spacing</span>
              </div>
              <div className="data-row" role="row">
                <span role="cell">Readability</span>
                <span role="cell">Sequencer camera playback</span>
                <span role="cell">Some phases were unclear from the first angle</span>
                <span role="cell">Reframed the camera around the movement path</span>
              </div>
            </div>
          </div>
        </section>
      </article>

      <section className="methods page-shell" id="methods">
        <header className="section-title">
          <div>
            <p className="kicker">Engineering methods</p>
            <h2>Measurement and documentation</h2>
          </div>
          <p>
            The portfolio separates observation from assumption. A number appears
            only when it exists in the project record.
          </p>
        </header>

        <div className="methods-grid">
          <figure>
            <img
              src={`${media}/electronics-lab-oscilloscope.jpeg`}
              alt="Electronics bench with waveform generator, oscilloscope, multimeter, and breadboard circuit"
            />
            <figcaption>Bench setup / source, circuit, and measured trace</figcaption>
          </figure>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Define</strong>
                <p>Inputs, outputs, constraints, interfaces, and failure modes.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Map</strong>
                <p>Power, signal, control, mechanical, and user paths.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Prototype</strong>
                <p>Test the highest-risk interface before final integration.</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong>Measure</strong>
                <p>Record a trace, reading, video, or repeatable functional check.</p>
              </div>
            </li>
            <li>
              <span>05</span>
              <div>
                <strong>Revise</strong>
                <p>Document the failure, change, and engineering reason.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="about page-shell" id="about">
        <div>
          <p className="kicker">About Brandon</p>
          <h2>Hands-on systems work, supported by clear records.</h2>
        </div>
        <div className="about-copy">
          <p>
            I am pursuing a Bachelor of Engineering Technology in Electronics &amp;
            Controls at Cape Breton University. My work spans embedded controllers,
            electronics benches, vehicle systems, enclosure integration, and digital
            motion prototyping.
          </p>
          <dl>
            <div>
              <dt>Embedded</dt>
              <dd>ESP32, Wi-Fi control, IR interfaces, configuration</dd>
            </div>
            <div>
              <dt>Electronics</dt>
              <dd>Oscilloscope, signal generator, multimeter, breadboard prototyping</dd>
            </div>
            <div>
              <dt>Integration</dt>
              <dd>Cable routing, enclosure modification, harness access, verification</dd>
            </div>
            <div>
              <dt>Digital systems</dt>
              <dd>Unreal Engine, character rigs, sequencing, motion review</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <div>
            <strong>Brandon Chen</strong>
            <span>B.Eng.Tech. — Electronics &amp; Controls</span>
          </div>
          <p>Open to engineering technology, controls, and prototyping opportunities.</p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}

function DiagramWithNote({
  label,
  steps,
  note,
}: {
  label: string;
  steps: FlowStep[];
  note: string;
}) {
  return (
    <div className="diagram-with-note">
      <FlowDiagram label={label} steps={steps} />
      <aside>
        <span>Architecture note</span>
        <p>{note}</p>
      </aside>
    </div>
  );
}
