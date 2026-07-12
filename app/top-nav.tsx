"use client";

import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "./page-transition";

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`nav${menuOpen ? " is-open" : ""}`} ref={navRef}>
      <TransitionLink
        className="nav__brand masthead-magnetic"
        href="/#top"
        data-magnetic-strength="18"
        onClick={closeMenu}
      >
        <span>Brandon Aris Chen</span>
      </TransitionLink>
      <nav className="nav__links" id="masthead-navigation" aria-label="Primary navigation">
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
    </header>
  );
}
