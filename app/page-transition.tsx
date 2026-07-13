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

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const targetHrefRef = useRef("");
  const targetPathRef = useRef("");

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
    if (phase === "idle") return;
    return lockPageScroll({ restoreScroll: false });
  }, [phase]);

  const finishTransitionStage = () => {
    if (phase === "covering") {
      setPhase("holding");
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
