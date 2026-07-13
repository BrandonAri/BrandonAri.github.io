"use client";

import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "./page-transition";

type NavigationTone = "dark" | "light";

const surfaceTone = (sampleY: number): NavigationTone => {
  const fixedSurfaces: Array<[string, NavigationTone]> = [
    [".about-placeholder", "dark"],
    [".experience-section", "dark"],
    [".work-section", "light"],
    [".contact-section", "light"],
    [".site-footer", "dark"],
  ];

  for (const [selector, tone] of fixedSurfaces) {
    const surface = document.querySelector<HTMLElement>(selector);
    if (!surface) continue;
    const bounds = surface.getBoundingClientRect();
    if (bounds.top <= sampleY && bounds.bottom > sampleY) return tone;
  }

  return "dark";
};

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tone, setTone] = useState<NavigationTone>("dark");
  const toneRef = useRef<NavigationTone>("dark");
  const navRef = useRef<HTMLElement>(null);
  const toneFrameRef = useRef(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || window.matchMedia("(max-width: 980px)").matches) return;

    const cleanups = Array.from(
      nav.querySelectorAll<HTMLElement>("[data-magnetic-strength]"),
    ).map((element) => {
      const strength = Number(element.dataset.magneticStrength ?? 12);
      const move = (event: MouseEvent) => {
        const bounds = element.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * strength;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * strength;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };
      const reset = () => {
        element.style.transform = "translate3d(0, 0, 0)";
      };

      element.addEventListener("mousemove", move);
      element.addEventListener("mouseleave", reset);
      return () => {
        element.removeEventListener("mousemove", move);
        element.removeEventListener("mouseleave", reset);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const mobilePortrait = window.matchMedia(
      "(max-width: 620px) and (orientation: portrait)",
    );
    let frame = 0;
    let lastY = Math.max(0, window.scrollY);
    let anchorY = lastY;
    let direction = 0;
    let touchAnchorY = 0;
    let ignoreScrollDirectionUntil = 0;

    const setData = (name: "atTop" | "surface" | "visible", value: boolean) => {
      const next = String(value);
      if (nav.dataset[name] !== next) nav.dataset[name] = next;
    };

    const update = () => {
      frame = 0;
      if (!mobilePortrait.matches) {
        delete nav.dataset.atTop;
        delete nav.dataset.surface;
        delete nav.dataset.visible;
        return;
      }

      const y = Math.max(0, window.scrollY);
      const atTop = y <= 18;
      let visible = nav.dataset.visible !== "false";
      const delta = y - lastY;

      if (atTop) {
        visible = true;
        direction = 0;
        anchorY = y;
      } else if (
        performance.now() >= ignoreScrollDirectionUntil &&
        Math.abs(delta) >= 1
      ) {
        const nextDirection = delta > 0 ? 1 : -1;
        if (nextDirection !== direction) {
          direction = nextDirection;
          anchorY = lastY;
        }

        const directionalTravel = y - anchorY;
        if (nextDirection > 0 && directionalTravel > 18) {
          visible = false;
          if (nav.classList.contains("is-open")) setMenuOpen(false);
        } else if (nextDirection < 0 && directionalTravel < -28) {
          visible = true;
        }
      }

      setData("atTop", atTop);
      setData("surface", !atTop);
      setData("visible", visible);
      lastY = y;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!mobilePortrait.matches) return;
      touchAnchorY = event.touches[0]?.clientY ?? 0;
      ignoreScrollDirectionUntil = Number.POSITIVE_INFINITY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!mobilePortrait.matches) return;
      const nextTouchY = event.touches[0]?.clientY;
      if (nextTouchY === undefined) return;
      const travel = nextTouchY - touchAnchorY;
      const atTop = window.scrollY <= 18;

      if (atTop) {
        setData("visible", true);
      } else if (travel < -14) {
        setData("visible", false);
        if (nav.classList.contains("is-open")) setMenuOpen(false);
        touchAnchorY = nextTouchY;
      } else if (travel > 14) {
        setData("visible", true);
        touchAnchorY = nextTouchY;
      }

      schedule();
    };

    const onTouchEnd = () => {
      ignoreScrollDirectionUntil = performance.now() + 1200;
      lastY = Math.max(0, window.scrollY);
      anchorY = lastY;
      direction = 0;
      schedule();
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    mobilePortrait.addEventListener("change", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      mobilePortrait.removeEventListener("change", schedule);
    };
  }, []);

  useEffect(() => {
    const updateTone = () => {
      toneFrameRef.current = 0;
      const nav = navRef.current;
      const sampleY = Math.max(34, nav?.getBoundingClientRect().bottom ?? 70);
      const stage = document.querySelector<HTMLElement>(".masthead-stage");
      if (stage) {
        const bounds = stage.getBoundingClientRect();
        if (bounds.top <= sampleY && bounds.bottom > sampleY) return;
      }
      const nextTone = surfaceTone(sampleY);
      applyTone(nextTone);
    };

    const applyTone = (nextTone: NavigationTone) => {
      if (document.documentElement.dataset.canvasTone !== nextTone) {
        document.documentElement.dataset.canvasTone = nextTone;
      }
      if (document.body.dataset.canvasTone !== nextTone) {
        document.body.dataset.canvasTone = nextTone;
      }
      const canvasColor = nextTone === "dark" ? "#111215" : "#f3f4f1";
      const themeColor = document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]',
      );
      if (themeColor?.content !== canvasColor) {
        themeColor?.setAttribute("content", canvasColor);
      }
      if (toneRef.current === nextTone) return;
      toneRef.current = nextTone;
      setTone(nextTone);
    };

    const scheduleTone = () => {
      if (!toneFrameRef.current) {
        toneFrameRef.current = window.requestAnimationFrame(updateTone);
      }
    };

    const handleThemeProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ tone?: NavigationTone }>).detail;
      if (detail?.tone) {
        applyTone(detail.tone);
        return;
      }
      scheduleTone();
    };

    applyTone("dark");
    updateTone();
    window.addEventListener("scroll", scheduleTone, { passive: true });
    window.addEventListener("resize", scheduleTone);
    window.addEventListener("pageshow", scheduleTone);
    window.addEventListener("portfolio-theme-progress", handleThemeProgress);
    return () => {
      window.cancelAnimationFrame(toneFrameRef.current);
      window.removeEventListener("scroll", scheduleTone);
      window.removeEventListener("resize", scheduleTone);
      window.removeEventListener("pageshow", scheduleTone);
      window.removeEventListener("portfolio-theme-progress", handleThemeProgress);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`nav${menuOpen ? " is-open" : ""}`}
      data-at-top="true"
      data-surface="false"
      data-tone={tone}
      data-visible="true"
      ref={navRef}
    >
      <div className="nav__bar">
        <TransitionLink
          className="nav__brand masthead-magnetic"
          href="/#top"
          data-magnetic-strength="18"
          onClick={closeMenu}
        >
          <span>Brandon Aris Chen</span>
        </TransitionLink>
        <nav
          className="nav__links"
          id="masthead-navigation"
          aria-label="Primary navigation"
        >
          <TransitionLink
            className="masthead-magnetic"
            href="/about"
            data-magnetic-strength="14"
            onClick={closeMenu}
          >
            About
          </TransitionLink>
          <TransitionLink
            className="masthead-magnetic"
            href="/#experience"
            data-magnetic-strength="14"
            onClick={closeMenu}
          >
            Experience
          </TransitionLink>
          <TransitionLink
            className="masthead-magnetic"
            href="/#work"
            data-magnetic-strength="14"
            onClick={closeMenu}
          >
            Engineering
          </TransitionLink>
          <TransitionLink
            className="masthead-magnetic"
            href="/#contact"
            data-magnetic-strength="14"
            onClick={closeMenu}
          >
            Contact
          </TransitionLink>
        </nav>
        <button
          className="menu-toggle masthead-magnetic"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="masthead-navigation"
          data-magnetic-strength="12"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
