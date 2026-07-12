"use client";

import { useEffect, useRef } from "react";
import { TopNav } from "./top-nav";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const repeatedNames = Array.from({ length: 8 }, (_, index) => index);
const idleNameSpeed = 42;
const maximumScrollNameSpeed = 1000;
const scrollBoostHold = 90;
const scrollSettleDuration = 950;

const linearProgress = (start: number, end: number, value: number) =>
  Math.min(1, Math.max(0, (value - start) / (end - start)));

type TimelineMetrics = {
  backgroundDistance: number;
  backgroundEnd: number;
  crossEnd: number;
  crossStart: number;
  exitEnd: number;
  exitStart: number;
  roleEnd: number;
  roleStart: number;
  stageHeight: number;
  totalTravel: number;
};

type RoleLineMotion = {
  element: HTMLSpanElement;
  startLeft: number;
  startTop: number;
  targetLeft: number;
  targetScale: number;
  targetTop: number;
};

const mixRgb = (
  from: [number, number, number],
  to: [number, number, number],
  progress: number,
) =>
  `rgb(${from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress)).join(" ")})`;

export function Masthead() {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const whiteIntroRef = useRef<HTMLElement>(null);
  const nameTrackRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLSpanElement>(null);
  const openingTravelRef = useRef(0);
  const openingVelocityRef = useRef(0);
  const roleMotionRef = useRef<RoleLineMotion[]>([]);
  const timelineMetricsRef = useRef<TimelineMetrics>({
    backgroundDistance: 1,
    backgroundEnd: 1,
    crossEnd: 3,
    crossStart: 2,
    exitEnd: 2,
    exitStart: 1,
    roleEnd: 1.5,
    roleStart: 0.1,
    stageHeight: 1,
    totalTravel: 3,
  });

  useEffect(() => {
    const sequence = sequenceRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const role = roleRef.current;
    const whiteIntro = whiteIntroRef.current;
    if (!sequence || !stage || !hero || !role || !whiteIntro) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shortLandscape = window.matchMedia(
      "(max-height: 620px) and (orientation: landscape)",
    );
    let frameId = 0;
    let displayTravel = 0;
    let displayVelocity = 0;
    let filteredRawVelocity = 0;
    let previousTarget = 0;
    let lastFrameTime = performance.now();
    let initialized = false;

    const isStaticLayout = () =>
      reducedMotion.matches || shortLandscape.matches;

    const roleLines = Array.from(
      role.querySelectorAll<HTMLSpanElement>("h1 span"),
    );

    const resetRoleMotion = () => {
      roleLines.forEach((line) => line.style.removeProperty("transform"));
      roleMotionRef.current = [];
    };

    const measureRoleMotion = () => {
      roleLines.forEach((line) => line.style.removeProperty("transform"));

      const heroBounds = hero.getBoundingClientRect();
      const lineBounds = roleLines.map((line) => line.getBoundingClientRect());
      const sideInset = Math.min(80, Math.max(16, hero.clientWidth * 0.05));
      const gap = Math.min(22, Math.max(6, hero.clientWidth * 0.012));
      const availableWidth = Math.max(1, hero.clientWidth - sideInset * 2);
      const naturalWidth = lineBounds.reduce(
        (total, bounds) => total + bounds.width,
        0,
      );
      const targetScale = Math.min(
        0.82,
        Math.max(
          0.32,
          (availableWidth - gap * Math.max(0, roleLines.length - 1)) /
            Math.max(1, naturalWidth),
        ),
      );
      const targetWidth =
        naturalWidth * targetScale + gap * Math.max(0, roleLines.length - 1);
      const targetHeight =
        Math.max(...lineBounds.map((bounds) => bounds.height), 1) * targetScale;
      const targetTop = (hero.clientHeight - targetHeight) / 2;
      let targetLeft = (hero.clientWidth - targetWidth) / 2;

      roleMotionRef.current = roleLines.map((element, index) => {
        const bounds = lineBounds[index];
        const motion = {
          element,
          startLeft: bounds.left - heroBounds.left,
          startTop: bounds.top - heroBounds.top,
          targetLeft,
          targetScale,
          targetTop,
        };
        targetLeft += bounds.width * targetScale + gap;
        return motion;
      });
    };

    const applyRoleMotion = (progress: number) => {
      const horizontalProgress = linearProgress(0, 0.62, progress);
      const verticalProgress = linearProgress(0.42, 1, progress);
      const scaleProgress = linearProgress(0.12, 0.88, progress);

      roleMotionRef.current.forEach((motion) => {
        const x =
          (motion.targetLeft - motion.startLeft) * horizontalProgress;
        const y = (motion.targetTop - motion.startTop) * verticalProgress;
        const scale = 1 + (motion.targetScale - 1) * scaleProgress;
        motion.element.style.transform =
          `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      });
    };

    const readTravel = () => {
      const totalTravel = Math.max(1, timelineMetricsRef.current.totalTravel);
      return Math.min(
        totalTravel,
        Math.max(0, -sequence.getBoundingClientRect().top),
      );
    };

    const renderTimeline = (travelled: number) => {
      const metrics = timelineMetricsRef.current;
      openingTravelRef.current = travelled;
      openingVelocityRef.current = displayVelocity;

      const backgroundProgress = linearProgress(
        0,
        metrics.backgroundEnd,
        travelled,
      );
      const crossProgress = linearProgress(
        metrics.crossStart,
        metrics.crossEnd,
        travelled,
      );
      const roleLag = Math.max(
        -metrics.stageHeight * 0.1,
        Math.min(metrics.stageHeight * 0.1, displayVelocity * 0.035),
      );
      const roleProgress = linearProgress(
        metrics.roleStart,
        metrics.roleEnd,
        travelled - roleLag,
      );

      stage.style.setProperty(
        "--opening-background",
        mixRgb([17, 18, 21], [243, 244, 241], backgroundProgress),
      );
      stage.style.setProperty(
        "--hero-background-y",
        `${-backgroundProgress * metrics.backgroundDistance}px`,
      );
      stage.style.setProperty(
        "--hero-background-opacity",
        `${1 - backgroundProgress}`,
      );
      stage.style.setProperty(
        "--hero-frame-y",
        `${-crossProgress * metrics.stageHeight}px`,
      );
      stage.style.setProperty(
        "--hero-foreground-color",
        mixRgb([243, 238, 229], [23, 26, 25], backgroundProgress),
      );
      stage.style.setProperty(
        "--white-intro-panel-y",
        `${(1 - crossProgress) * metrics.stageHeight}px`,
      );
      applyRoleMotion(roleProgress);
      whiteIntro.inert = crossProgress < 0.995;
    };

    const measureTimeline = () => {
      if (isStaticLayout()) {
        sequence.style.height = "";
        openingTravelRef.current = 0;
        openingVelocityRef.current = 0;
        resetRoleMotion();
        whiteIntro.inert = false;
        return false;
      }

      const oldMetrics = timelineMetricsRef.current;
      const stageHeight = stage.clientHeight || window.innerHeight;
      const viewportWidth = window.innerWidth;
      const unitWidth =
        firstNameRef.current?.getBoundingClientRect().width ??
        viewportWidth * 0.72;
      const gutter = Math.max(24, viewportWidth * 0.02);
      const backgroundLength = stageHeight * (viewportWidth <= 620 ? 0.52 : 0.62);
      const typicalTailDistance = viewportWidth + unitWidth * 0.35 + gutter;
      const exitLength = Math.max(
        stageHeight * 0.75,
        typicalTailDistance / 1.55,
      );
      const crossLength = stageHeight * 0.82;
      const holdLength = stageHeight * 0.18;
      const exitStart = backgroundLength;
      const exitEnd = exitStart + exitLength;
      const crossStart = exitEnd;
      const crossEnd = crossStart + crossLength;
      const totalTravel = crossEnd + holdLength;

      timelineMetricsRef.current = {
        backgroundDistance: stageHeight * 0.2,
        backgroundEnd: backgroundLength,
        crossEnd,
        crossStart,
        exitEnd,
        exitStart,
        roleEnd: backgroundLength,
        roleStart: 0,
        stageHeight,
        totalTravel,
      };
      sequence.style.height = `${totalTravel + stageHeight}px`;
      measureRoleMotion();

      if (initialized && oldMetrics.totalTravel > 0) {
        const scale = totalTravel / oldMetrics.totalTravel;
        displayTravel = Math.min(totalTravel, displayTravel * scale);
        displayVelocity *= scale;
      }

      previousTarget = readTravel();
      filteredRawVelocity = 0;
      return true;
    };

    const tick = (now: number) => {
      frameId = 0;

      if (isStaticLayout()) {
        openingTravelRef.current = 0;
        openingVelocityRef.current = 0;
        whiteIntro.inert = false;
        return;
      }

      const metrics = timelineMetricsRef.current;
      const deltaTime = Math.min(
        1 / 30,
        Math.max(1 / 240, (now - lastFrameTime) / 1000),
      );
      lastFrameTime = now;

      const targetTravel = readTravel();
      const rawVelocitySample = (targetTravel - previousTarget) / deltaTime;
      filteredRawVelocity +=
        (rawVelocitySample - filteredRawVelocity) *
        (1 - Math.exp(-12 * deltaTime));
      previousTarget = targetTravel;

      const absoluteRawVelocity = Math.abs(filteredRawVelocity);
      const desiredLag = Math.min(
        metrics.stageHeight * 0.18,
        56 + absoluteRawVelocity * 0.13,
      );
      const omega =
        absoluteRawVelocity < 1
          ? 6
          : Math.min(
              14,
              Math.max(6, (2 * absoluteRawVelocity) / desiredLag),
            );
      const delta = displayTravel - targetTravel;
      const decay = Math.exp(-omega * deltaTime);
      const velocityStep = (displayVelocity + omega * delta) * deltaTime;
      displayTravel =
        targetTravel + (delta + velocityStep) * decay;
      displayVelocity =
        (displayVelocity - omega * velocityStep) * decay;

      displayTravel = Math.min(
        metrics.totalTravel,
        Math.max(0, displayTravel),
      );

      if (
        (displayTravel <= 0 && displayVelocity < 0) ||
        (displayTravel >= metrics.totalTravel && displayVelocity > 0)
      ) {
        displayVelocity = 0;
      }

      const travelGap = targetTravel - displayTravel;
      if (
        Math.abs(travelGap) < 0.12 &&
        Math.abs(displayVelocity) < 0.12 &&
        Math.abs(filteredRawVelocity) < 0.5
      ) {
        displayTravel = targetTravel;
        displayVelocity = 0;
        filteredRawVelocity = 0;
      }

      renderTimeline(displayTravel);

      if (
        Math.abs(targetTravel - displayTravel) >= 0.12 ||
        Math.abs(displayVelocity) >= 0.12 ||
        Math.abs(filteredRawVelocity) >= 0.5
      ) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleUpdate = () => {
      if (!frameId) {
        lastFrameTime = performance.now();
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      if (measureTimeline()) {
        if (!initialized) {
          displayTravel = readTravel();
          previousTarget = displayTravel;
          initialized = true;
          renderTimeline(displayTravel);
        }
        scheduleUpdate();
      } else {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const timelineResizeObserver = new ResizeObserver(onResize);
    timelineResizeObserver.observe(stage);
    if (firstNameRef.current) timelineResizeObserver.observe(firstNameRef.current);
    roleLines.forEach((line) => timelineResizeObserver.observe(line));

    if (measureTimeline()) {
      displayTravel = readTravel();
      previousTarget = displayTravel;
      initialized = true;
      renderTimeline(displayTravel);
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", onResize);
    reducedMotion.addEventListener("change", onResize);
    shortLandscape.addEventListener("change", onResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      timelineResizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", onResize);
      shortLandscape.removeEventListener("change", onResize);
      resetRoleMotion();
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const track = nameTrackRef.current;
    const firstName = firstNameRef.current;
    if (!hero || !track || !firstName) return;
    const nameSpans = Array.from(track.children) as HTMLSpanElement[];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      track.style.transform = "translate3d(-3vw, 0, 0)";
      track.style.willChange = "auto";
      return;
    }

    let frameId = 0;
    let unitWidth = firstName.getBoundingClientRect().width;
    let phase = 44;
    let direction = 1;
    let speed = idleNameSpeed;
    let boostedSpeed = idleNameSpeed;
    let lastBoostTime = Number.NEGATIVE_INFINITY;
    let lastFrameTime = performance.now();
    let lastScrollY = window.scrollY;
    let lastWheelTime = 0;
    let isVisible = true;
    let marqueeExiting = false;
    let exitStartPhase = 0;
    let exitEndPhase = 0;

    const wrapPhase = (value: number) => {
      if (!unitWidth) return value;
      return ((value % unitWidth) + unitWidth) % unitWidth;
    };

    const showAllNames = () => {
      nameSpans.forEach((span) => {
        span.hidden = false;
      });
    };

    const beginMarqueeExit = () => {
      if (!unitWidth) return;
      phase = wrapPhase(phase);
      const visibleNameCount = Math.min(
        nameSpans.length,
        Math.max(1, Math.ceil((window.innerWidth + phase) / unitWidth)),
      );

      nameSpans.forEach((span, index) => {
        span.hidden = index >= visibleNameCount;
      });

      exitStartPhase = phase;
      exitEndPhase =
        visibleNameCount * unitWidth + Math.max(24, window.innerWidth * 0.02);
      marqueeExiting = true;
    };

    const resumeMarqueeLoop = () => {
      showAllNames();
      phase = wrapPhase(phase);
      marqueeExiting = false;
    };

    const nudge = (delta: number) => {
      if (Math.abs(delta) < 0.5) return;
      direction = delta > 0 ? 1 : -1;
      const directSpeed = 130 + Math.abs(delta) * 5;
      const carriedSpeed = Math.abs(speed) + Math.abs(delta) * 2;
      boostedSpeed =
        direction *
        Math.min(maximumScrollNameSpeed, Math.max(directSpeed, carriedSpeed));
      lastBoostTime = performance.now();
    };

    const onWheel = (event: WheelEvent) => {
      lastWheelTime = performance.now();
      nudge(event.deltaY);
    };

    const onScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (performance.now() - lastWheelTime > 80) nudge(delta);
    };

    const measure = () => {
      const previousUnitWidth = unitWidth;
      unitWidth = firstName.getBoundingClientRect().width;
      if (marqueeExiting) {
        const exitProgress = linearProgress(
          timelineMetricsRef.current.exitStart,
          timelineMetricsRef.current.exitEnd,
          openingTravelRef.current,
        );
        const widthScale = previousUnitWidth
          ? unitWidth / previousUnitWidth
          : 1;
        exitStartPhase *= widthScale;
        const visibleNameCount = Math.min(
          nameSpans.length,
          Math.max(
            1,
            Math.ceil((window.innerWidth + exitStartPhase) / unitWidth),
          ),
        );
        nameSpans.forEach((span, index) => {
          span.hidden = index >= visibleNameCount;
        });
        exitEndPhase =
          visibleNameCount * unitWidth +
          Math.max(24, window.innerWidth * 0.02);
        phase =
          exitStartPhase +
          (exitEndPhase - exitStartPhase) * exitProgress;
      } else {
        phase = wrapPhase(phase);
      }
    };

    const updateMarqueeSpeed = (now: number, deltaTime: number) => {
      const idleSpeed = direction * idleNameSpeed;
      const settleElapsed = Math.max(
        0,
        now - lastBoostTime - scrollBoostHold,
      );
      const settleProgress = Math.min(
        1,
        settleElapsed / scrollSettleDuration,
      );
      const easedSettle =
        settleProgress * settleProgress * (3 - 2 * settleProgress);
      const targetSpeed =
        idleSpeed + (boostedSpeed - idleSpeed) * (1 - easedSettle);
      const reversing = Math.sign(targetSpeed) !== Math.sign(speed);
      const accelerating = Math.abs(targetSpeed) > Math.abs(speed);
      const response = reversing ? 14 : accelerating ? 12 : 3.4;
      speed += (targetSpeed - speed) * (1 - Math.exp(-response * deltaTime));
    };

    const frame = (now: number) => {
      const deltaTime = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
      lastFrameTime = now;

      if (isVisible && unitWidth) {
        const travelled = openingTravelRef.current;
        const exitStart = timelineMetricsRef.current.exitStart;
        updateMarqueeSpeed(now, deltaTime);

        if (
          travelled >= exitStart &&
          !marqueeExiting
        ) {
          beginMarqueeExit();
        }

        if (
          marqueeExiting &&
          travelled < exitStart
        ) {
          resumeMarqueeLoop();
        }

        if (marqueeExiting) {
          const exitProgress = linearProgress(
            timelineMetricsRef.current.exitStart,
            timelineMetricsRef.current.exitEnd,
            openingTravelRef.current,
          );
          phase =
            exitStartPhase +
            (exitEndPhase - exitStartPhase) * exitProgress;
        } else {
          phase = wrapPhase(phase + speed * deltaTime);
        }

        track.style.transform = `translate3d(${-phase}px, 0, 0)`;
      }

      frameId = window.requestAnimationFrame(frame);
    };

    const resizeObserver = new ResizeObserver(measure);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      lastFrameTime = performance.now();
    });

    resizeObserver.observe(firstName);
    visibilityObserver.observe(hero);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      showAllNames();
    };
  }, []);

  return (
    <>
      <TopNav />

      <div className="masthead-sequence" ref={sequenceRef}>
        <div className="masthead-stage" ref={stageRef}>
          <section className="hero" aria-labelledby="hero-role-title" ref={heroRef}>
            <div className="hero__background-layer" aria-hidden="true">
              <div className="hero__photo">
                <img src={`${basePath}/media/portrait-light-scan.jpeg`} alt="" />
              </div>
              <div className="hero__shade" />
            </div>

            <div className="hero__foreground-layer">
              <div className="hero__role" ref={roleRef}>
                <h1
                  id="hero-role-title"
                  aria-label="Hardware engineer. App developer. PM."
                >
                  <span aria-hidden="true">Hardware engineer.</span>
                  <span aria-hidden="true">App developer.</span>
                  <span aria-hidden="true">PM.</span>
                </h1>
              </div>

              <div className="hero__name" aria-hidden="true">
                <div className="hero__name-track" data-hero-name ref={nameTrackRef}>
                  {repeatedNames.map((index) => (
                    <span key={index} ref={index === 0 ? firstNameRef : undefined}>
                      Brandon Chen
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            className="white-intro"
            id="profile"
            aria-labelledby="profile-title"
            ref={whiteIntroRef}
            inert
          >
            <div className="page-shell white-intro__inner">
              <p className="eyebrow">Electronics &amp; Controls · Hardware Development</p>
              <h2 id="profile-title">
                <span
                  className="profile-name-swap"
                  tabIndex={0}
                  aria-label="Brandon Chen. Hover to reveal Xuze Chen."
                >
                  <span className="profile-name-swap__first" aria-hidden="true">
                    <span className="profile-name-swap__default">Brandon</span>
                    <span className="profile-name-swap__alternate">(Xuze)</span>
                  </span>{" "}
                  <span aria-hidden="true">Chen</span>
                </span>
              </h2>
              <p className="white-intro__degree">
                Bachelor of Engineering Technology, Electronics &amp; Controls
                <span>
                  <a href="https://www.cbu.ca/" target="_blank" rel="noreferrer">
                    Cape Breton University
                  </a>
                </span>
              </p>

              <div className="white-intro__body">
                <p className="white-intro__statement">
                  I develop practical systems where electronics, embedded controllers,
                  sensors, and software have to work together as one product.
                </p>
                <div className="white-intro__support">
                  <p>
                    My experience spans circuit analysis, analog electronics,
                    device-sensor integration, mobile and wearable APIs, hardware
                    prototyping, and product implementation.
                  </p>
                  <div className="white-intro__links">
                    <a className="white-intro__primary" href="#experience">
                      View experience <span aria-hidden="true">↓</span>
                    </a>
                    <a className="white-intro__secondary" href="#work">
                      Selected work <span aria-hidden="true">↘</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
