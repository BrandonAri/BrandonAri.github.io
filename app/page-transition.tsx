"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { lockPageScroll } from "./scroll-lock";

type TransitionPhase = "idle" | "covering" | "holding" | "revealing";

type PageTransitionContextValue = {
  navigate: (href: string) => void;
  transitioning: boolean;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

const revealFlag = "pt-reveal";

const clearPendingReveal = () => {
  delete document.documentElement.dataset.ptReveal;
  try {
    window.sessionStorage.removeItem(revealFlag);
  } catch {
    // Private browsing may block storage; the html attribute is already gone.
  }
};

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const targetHrefRef = useRef("");
  const targetPathRef = useRef("");

  useEffect(() => {
    // Route changes are full document loads in the static export, so the
    // reveal half of the transition cannot rely on React state surviving
    // navigation. The previous page sets the reveal flag, an inline script
    // in the document head keeps the layer covering the first paint, and
    // this effect resumes the transition from its holding phase.
    if (!document.documentElement.dataset.ptReveal) return;
    try {
      window.sessionStorage.removeItem(revealFlag);
    } catch {
      // Storage already served its purpose via the inline script.
    }
    const resumeFrame = window.requestAnimationFrame(() => {
      targetPathRef.current = pathname;
      setPhase("holding");
    });
    return () => window.cancelAnimationFrame(resumeFrame);
  }, [pathname]);

  useEffect(() => {
    if (phase !== "revealing") return;
    // The is-revealing class now drives the layer, so the pre-paint cover
    // attribute (and its flag) must not leak into the next navigation.
    clearPendingReveal();
  }, [phase]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      clearPendingReveal();
      setPhase("idle");
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== "idle") return;
      const destination = new URL(href, window.location.href);
      targetHrefRef.current = `${destination.pathname}${destination.search}${destination.hash}`;
      targetPathRef.current = destination.pathname;
      setPhase("covering");
    },
    [phase],
  );

  useEffect(() => {
    if (phase !== "holding" || pathname !== targetPathRef.current) return;

    let revealFrame = 0;
    const routeFrame = window.requestAnimationFrame(() => {
      revealFrame = window.requestAnimationFrame(() => setPhase("revealing"));
    });

    return () => {
      window.cancelAnimationFrame(routeFrame);
      window.cancelAnimationFrame(revealFrame);
    };
  }, [pathname, phase]);

  useEffect(() => {
    // Only the departing page needs its scroll frozen while the mask covers
    // it. The destination document must stay free to honor anchor targets.
    if (phase !== "covering") return;
    return lockPageScroll({ restoreScroll: false });
  }, [phase]);

  const finishTransitionStage = () => {
    if (phase === "covering") {
      setPhase("holding");
      try {
        window.sessionStorage.setItem(revealFlag, "1");
      } catch {
        // Without storage the destination simply loads without the reveal.
      }
      router.push(targetHrefRef.current);
      return;
    }

    if (phase === "revealing") {
      targetHrefRef.current = "";
      targetPathRef.current = "";
      setPhase("idle");
    }
  };

  return (
    <PageTransitionContext.Provider
      value={{ navigate, transitioning: phase !== "idle" }}
    >
      {children}
      <div
        className={`page-transition-layer is-${phase}`}
        aria-hidden="true"
        onAnimationEnd={finishTransitionStage}
      >
        <span />
      </div>
    </PageTransitionContext.Provider>
  );
}

type TransitionLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  children: ReactNode;
  href: string;
};

export function TransitionLink({
  children,
  href,
  onClick,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname();
  const transition = useContext(PageTransitionContext);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    const destination = new URL(href, window.location.href);
    if (
      !transition ||
      destination.origin !== window.location.origin ||
      destination.pathname === pathname
    ) {
      return;
    }

    event.preventDefault();
    if (!transition.transitioning) transition.navigate(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
