import type { Metadata } from "next";
import { TransitionLink } from "../page-transition";
import { TopNav } from "../top-nav";

export const metadata: Metadata = {
  title: "About — In Development | Brandon Aris Chen",
  description: "The About page for Brandon Aris Chen is currently in development.",
};

export default function AboutPage() {
  return (
    <main className="about-placeholder">
      <TopNav />

      <section className="about-placeholder__content" aria-labelledby="about-title">
        <div className="about-placeholder__meta">
          <span>About / 01</span>
          <span>In development</span>
        </div>

        <div className="about-placeholder__message">
          <h1 id="about-title">
            Still building
            <span>this page.</span>
          </h1>
          <p>
            The About section is being developed. The portfolio, experience, and
            engineering project records remain available now.
          </p>
        </div>

        <div className="about-placeholder__footer">
          <div className="about-placeholder__progress" aria-hidden="true">
            <span />
          </div>
          <TransitionLink href="/">
            Return to portfolio <span aria-hidden="true">↗</span>
          </TransitionLink>
        </div>
      </section>
    </main>
  );
}
