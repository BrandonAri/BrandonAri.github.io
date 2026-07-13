"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
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

  const stage = document.querySelector<HTMLElement>(".masthead-stage");
  if (stage) {
    const bounds = stage.getBoundingClientRect();
    if (bounds.top <= sampleY && bounds.bottom > sampleY) {
      const channels = getComputedStyle(stage).backgroundColor.match(/[\d.]+/g);
      if (channels && channels.length >= 3) {
        const [red, green, blue] = channels.map(Number);
        const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        return luminance > 150 ? "light" : "dark";
      }
    }
  }

  return "dark";
};

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tone, setTone] = useState<NavigationTone>("dark");
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const glassFrameRef = useRef(0);
  const toneFrameRef = useRef(0);
  const pulseTimerRef = useRef<number | null>(null);

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
    const updateTone = () => {
      toneFrameRef.current = 0;
      const sampleY = Math.max(34, navRef.current?.getBoundingClientRect().bottom ?? 70);
      const nextTone = surfaceTone(sampleY);
      setTone((current) => (current === nextTone ? current : nextTone));
      document
        .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.setAttribute("content", nextTone === "dark" ? "#111215" : "#f3f4f1");
    };

    const scheduleTone = () => {
      if (!toneFrameRef.current) {
        toneFrameRef.current = window.requestAnimationFrame(updateTone);
      }
    };

    updateTone();
    window.addEventListener("scroll", scheduleTone, { passive: true });
    window.addEventListener("resize", scheduleTone);
    window.addEventListener("pageshow", scheduleTone);
    window.addEventListener("portfolio-theme-progress", scheduleTone);
    return () => {
      window.cancelAnimationFrame(toneFrameRef.current);
      window.removeEventListener("scroll", scheduleTone);
      window.removeEventListener("resize", scheduleTone);
      window.removeEventListener("pageshow", scheduleTone);
      window.removeEventListener("portfolio-theme-progress", scheduleTone);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(glassFrameRef.current);
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const moveGlassHighlight = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bar = barRef.current;
    if (!bar) return;
    const { clientX, clientY } = event;
    window.cancelAnimationFrame(glassFrameRef.current);
    glassFrameRef.current = window.requestAnimationFrame(() => {
      const bounds = bar.getBoundingClientRect();
      bar.style.setProperty("--glass-x", `${clientX - bounds.left}px`);
      bar.style.setProperty("--glass-y", `${clientY - bounds.top}px`);
    });
  };

  const pulseGlass = () => {
    const bar = barRef.current;
    if (!bar) return;
    bar.classList.remove("is-glass-active");
    window.requestAnimationFrame(() => bar.classList.add("is-glass-active"));
    if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(
      () => bar.classList.remove("is-glass-active"),
      560,
    );
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`nav${menuOpen ? " is-open" : ""}`}
      data-tone={tone}
      ref={navRef}
    >
      <div
        className="nav__bar"
        ref={barRef}
        onPointerMove={moveGlassHighlight}
        onPointerDown={pulseGlass}
      >
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
