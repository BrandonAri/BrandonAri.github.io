"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  TransitionEvent as ReactTransitionEvent,
} from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const media = `${basePath}/media`;
type ProjectId = "heater" | "vehicle";
type SheetPhase = "opening" | "open" | "closing";

const projects = [
  {
    id: "heater" as const,
    number: "01",
    title: "ESP32 Space-Heater Control Retrofit",
    discipline: "Embedded systems · IR reverse engineering",
    summary:
      "Capturing, decoding, and replaying the heater's IR commands through a wired ESP32 interface.",
    image: `${media}/smartify-open-chassis.jpeg`,
    imageAlt:
      "Open space-heater chassis showing the original controller and added ESP32 wiring",
  },
  {
    id: "vehicle" as const,
    number: "02",
    title: "Vehicle SRS & Steering Repair",
    discipline: "Automotive electrical · Mechanical service",
    summary:
      "Replacing failed seat-belt pretensioners, the SRS module, and a snapped inner tie rod.",
    image: `${media}/car-seatbelts.jpeg`,
    imageAlt: "Replacement SRS module and seat-belt pretensioners in a box",
  },
];

export function ProjectArchive() {
  const [activeProject, setActiveProject] = useState<ProjectId | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [sheetPhase, setSheetPhase] = useState<SheetPhase>("opening");
  const dragStart = useRef(0);
  const dragOffsetRef = useRef(0);
  const draggingRef = useRef(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const closeProjectRef = useRef<() => void>(() => undefined);
  const removeDragListenersRef = useRef<(() => void) | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement>(null);

  const finishClose = () => {
    if (!closingRef.current) return;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    closingRef.current = false;
    dragOffsetRef.current = 0;
    setActiveProject(null);
    setDragOffset(0);
    setDragging(false);
    setSheetPhase("opening");
    draggingRef.current = false;
    window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  };

  const closeProject = () => {
    if (!activeProject || closingRef.current) return;
    removeDragListenersRef.current?.();
    draggingRef.current = false;
    closingRef.current = true;
    setDragging(false);
    setSheetPhase("closing");
    closeTimerRef.current = window.setTimeout(finishClose, 360);
  };

  useEffect(() => {
    closeProjectRef.current = closeProject;
  });

  useEffect(() => {
    if (!activeProject) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    let settleFrame = 0;
    const openingFrame = window.requestAnimationFrame(() => {
      settleFrame = window.requestAnimationFrame(() => {
        if (!closingRef.current) setSheetPhase("open");
      });
    });

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProjectRef.current();
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.cancelAnimationFrame(openingFrame);
      window.cancelAnimationFrame(settleFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeProject]);

  useEffect(() => {
    return () => {
      removeDragListenersRef.current?.();
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openProject = (project: ProjectId, trigger: HTMLButtonElement) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    lastTriggerRef.current = trigger;
    closingRef.current = false;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setDragging(false);
    setSheetPhase("opening");
    setActiveProject(project);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    removeDragListenersRef.current?.();
    dragStart.current = event.clientY;
    draggingRef.current = true;
    setDragging(true);
    const pointerId = event.pointerId;

    function removeListeners() {
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", cancelDrag);
      removeDragListenersRef.current = null;
    }

    function moveDrag(pointerEvent: PointerEvent) {
      if (!draggingRef.current || pointerEvent.pointerId !== pointerId) return;
      const nextOffset = Math.max(0, pointerEvent.clientY - dragStart.current);
      dragOffsetRef.current = nextOffset;
      setDragOffset(nextOffset);
    }

    function endDrag(pointerEvent: PointerEvent) {
      if (pointerEvent.pointerId !== pointerId) return;
      removeListeners();
      draggingRef.current = false;
      setDragging(false);
      if (dragOffsetRef.current > 120) closeProject();
      else {
        dragOffsetRef.current = 0;
        setDragOffset(0);
      }
    }

    function cancelDrag(pointerEvent: PointerEvent) {
      if (pointerEvent.pointerId !== pointerId) return;
      removeListeners();
      draggingRef.current = false;
      dragOffsetRef.current = 0;
      setDragging(false);
      setDragOffset(0);
    }

    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", cancelDrag);
    removeDragListenersRef.current = removeListeners;
  };

  const finishCloseOnTransition = (
    event: ReactTransitionEvent<HTMLElement>,
  ) => {
    if (
      sheetPhase === "closing" &&
      event.target === event.currentTarget &&
      event.propertyName === "transform"
    ) {
      finishClose();
    }
  };

  return (
    <section className="work-section" id="work">
      <div className="page-shell">
        <header className="section-heading-stacked work-heading">
          <h2>Selected engineering projects</h2>
          <p className="section-heading-meta">
            <span>Selected Work</span>
            <span>Embedded control and automotive repair, from implementation through verification.</span>
          </p>
        </header>

        <div className="project-cards">
          {projects.map((project) => (
            <button
              className="project-card"
              key={project.id}
              onClick={(event) => openProject(project.id, event.currentTarget)}
              type="button"
              aria-haspopup="dialog"
            >
              <div className="project-card-image">
                <img src={project.image} alt={project.imageAlt} />
                <span>{project.number}</span>
              </div>
              <div className="project-card-copy">
                <p>{project.discipline}</p>
                <h3>{project.title}</h3>
                <span>{project.summary}</span>
                <strong>Open project <i aria-hidden="true">↗</i></strong>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeProject ? (
        <div className={`sheet-layer is-${sheetPhase}`} role="presentation">
          <button
            className="sheet-backdrop"
            type="button"
            onClick={closeProject}
            aria-label="Close project"
          />
          <article
            className={`project-sheet is-${sheetPhase}${dragging ? " is-dragging" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${activeProject}-sheet-title`}
            onTransitionEnd={finishCloseOnTransition}
            style={{ "--sheet-drag-y": `${dragOffset}px` } as CSSProperties}
          >
            <div className="sheet-controls">
              <button
                className="drag-handle"
                type="button"
                onPointerDown={beginDrag}
                aria-label="Drag down to close project"
              >
                <span />
              </button>
              <button
                className="sheet-close"
                type="button"
                onClick={closeProject}
                ref={closeButtonRef}
              >
                Close <span aria-hidden="true">×</span>
              </button>
            </div>

            {activeProject === "heater" ? <HeaterProject /> : <VehicleProject />}
          </article>
        </div>
      ) : null}
    </section>
  );
}

function ProjectFlow({ steps }: { steps: { title: string; detail: string }[] }) {
  return (
    <div className="project-flow" aria-label="System architecture">
      {steps.map((step, index) => (
        <div className="flow-part" key={step.title}>
          <div>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.title}</strong>
            <small>{step.detail}</small>
          </div>
          {index < steps.length - 1 ? <i aria-hidden="true">→</i> : null}
        </div>
      ))}
    </div>
  );
}

function HeaterProject() {
  return (
    <div className="sheet-content">
      <header className="sheet-heading">
        <p>Project 01 · Embedded systems</p>
        <h2 id="heater-sheet-title">ESP32 Space-Heater Control Retrofit</h2>
        <span>
          Reverse engineering the heater&apos;s IR command path, then injecting the
          decoded commands through a permanently installed ESP32.
        </span>
      </header>

      <figure className="sheet-hero">
        <img
          src={`${media}/smartify-open-chassis.jpeg`}
          alt="Open space-heater chassis showing the original controller, fan, and installed electronics"
        />
        <figcaption>Installed prototype / original heater controller retained</figcaption>
      </figure>

      <section className="project-section project-overview">
        <div className="project-section-label">Problem</div>
        <div>
          <h3>Make a conventional heater accept commands from an ESP32.</h3>
          <p>
            The heater already understood its handheld remote, so the goal was not
            to replace the factory controller. The goal was to observe the existing
            IR receiver signal, decode the command patterns, and reproduce them
            electrically so the heater would interpret the ESP32 as its remote.
          </p>
        </div>
      </section>

      <section className="project-section">
        <div className="project-section-label">Architecture</div>
        <div>
          <ProjectFlow
            steps={[
              { title: "IR remote", detail: "Original commands" },
              { title: "Receiver tap", detail: "Branched signal wire" },
              { title: "ESP32 capture", detail: "Record and decode" },
              { title: "Signal replay", detail: "Inject command" },
              { title: "Heater controller", detail: "Accept as remote" },
            ]}
          />
        </div>
      </section>

      <section className="project-section">
        <div className="project-section-label">My work</div>
        <ul className="project-work-list">
          <li>Branched a wire from the heater&apos;s IR receiver signal path.</li>
          <li>Captured command data sent by the original remote.</li>
          <li>Decoded and organized the captured command patterns.</li>
          <li>Replayed the signals from the ESP32 into the heater controller.</li>
          <li>Installed the ESP32, rewired the enclosure, and added USB power.</li>
          <li>Verified that the heater responded as though the original remote was used.</li>
        </ul>
      </section>

      <section className="project-section">
        <div className="project-section-label">Implementation</div>
        <div className="spec-table">
          <div><span>Controller</span><strong>ESP32</strong></div>
          <div><span>Interface</span><strong>Wired IR receiver signal tap</strong></div>
          <div><span>Method</span><strong>Capture · decode · replay</strong></div>
          <div><span>Power</span><strong>Dedicated USB cable</strong></div>
        </div>
      </section>

      <section className="project-section evidence-section">
        <div className="project-section-label">Build evidence</div>
        <div className="evidence-stack">
          <figure>
            <img
              src={`${media}/smartify-ir-board.jpeg`}
              alt="Infrared receiver board connected to the ESP32 signal wiring"
            />
            <figcaption>IR receiver signal branch used for capture and injection</figcaption>
          </figure>
          <figure>
            <img
              src={`${media}/smartify-esp32-installed.jpeg`}
              alt="ESP32 installed and insulated inside the heater"
            />
            <figcaption>ESP32 installed with insulation and dedicated USB power</figcaption>
          </figure>
          <figure>
            <img
              src={`${media}/smartify-cable-routing.jpeg`}
              alt="Final cable routing inside the heater enclosure"
            />
            <figcaption>Rewired enclosure and final cable routing</figcaption>
          </figure>
        </div>
      </section>

      <section className="project-section">
        <div className="project-section-label">Verification</div>
        <div className="project-videos">
          <figure>
            <video
              controls
              playsInline
              preload="metadata"
              poster={`${media}/smartify-demo-poster.jpeg`}
            >
              <source src={`${media}/smartify-demo.mp4`} type="video/mp4" />
            </video>
            <figcaption>Live heater-control demonstration</figcaption>
          </figure>
          <figure>
            <video controls playsInline preload="metadata">
              <source src={`${media}/smartify-config.mp4`} type="video/mp4" />
            </video>
            <figcaption>ESP32 configuration and command setup</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}

function VehicleProject() {
  return (
    <div className="sheet-content">
      <header className="sheet-heading">
        <p>Project 02 · Automotive repair</p>
        <h2 id="vehicle-sheet-title">Vehicle SRS &amp; Steering Repair</h2>
        <span>
          Replacing both failed seat-belt pretensioners, the SRS control module,
          and a snapped inner tie rod to restore the vehicle.
        </span>
      </header>

      <figure className="sheet-hero vehicle-sheet-hero">
        <img
          src={`${media}/car-seatbelts.jpeg`}
          alt="Replacement SRS control module and two seat-belt pretensioners"
        />
        <figcaption>Replacement SRS module and both seat-belt pretensioners</figcaption>
      </figure>

      <section className="project-section project-overview">
        <div className="project-section-label">Problem</div>
        <div>
          <h3>Multiple failed safety components and a separate steering failure.</h3>
          <p>
            Both seat-belt pretensioners and the SRS module required replacement.
            The vehicle also had a snapped inner tie rod. The work required interior
            disassembly for the restraint system and mechanical repair to return the
            vehicle to drivable condition.
          </p>
        </div>
      </section>

      <section className="project-section">
        <div className="project-section-label">Repair scope</div>
        <div className="spec-table">
          <div><span>SRS</span><strong>Control module replaced</strong></div>
          <div><span>Restraints</span><strong>Two pretensioners replaced</strong></div>
          <div><span>Steering</span><strong>Inner tie rod replaced</strong></div>
          <div><span>Outcome</span><strong>Operation and drivability restored</strong></div>
        </div>
      </section>

      <section className="project-section">
        <div className="project-section-label">Workflow</div>
        <div>
          <ProjectFlow
            steps={[
              { title: "Diagnose", detail: "Identify failed parts" },
              { title: "Make safe", detail: "Isolate electrical system" },
              { title: "Gain access", detail: "Remove interior panels" },
              { title: "Replace", detail: "SRS and steering parts" },
              { title: "Verify", detail: "Reassemble and test" },
            ]}
          />
        </div>
      </section>

      <section className="project-section evidence-section">
        <div className="project-section-label">Repair evidence</div>
        <div className="evidence-stack">
          <figure>
            <img
              src={`${media}/car-dash-teardown.jpeg`}
              alt="Vehicle dashboard and center console disassembled to reach the SRS module"
            />
            <figcaption>Center-console access for SRS module replacement</figcaption>
          </figure>
          <figure>
            <img
              src={`${media}/car-rear-seat-teardown.jpeg`}
              alt="Vehicle rear seating area disassembled for restraint-system access"
            />
            <figcaption>Rear seating removed for restraint-system access</figcaption>
          </figure>
          <figure>
            <img
              src={`${media}/vehicle-panel-teardown.jpeg`}
              alt="Vehicle side trim removed to expose wiring and seat-belt mounting areas"
            />
            <figcaption>Side-trim access and wiring inspection before reinstallation</figcaption>
          </figure>
        </div>
      </section>

      <section className="project-section">
        <div className="project-section-label">Record</div>
        <div className="project-videos single-video">
          <figure>
            <video
              controls
              playsInline
              preload="metadata"
              poster={`${media}/car-repair-poster.jpeg`}
            >
              <source src={`${media}/car-repair.mp4`} type="video/mp4" />
            </video>
            <figcaption>Repair and reinstallation record</figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
