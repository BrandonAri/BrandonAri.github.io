"use client";

import { useState } from "react";

export function MobileGate() {
  const [dismissed, setDismissed] = useState(false);

  const enterAnyway = () => {
    setDismissed(true);
    document.documentElement.dataset.mobileGate = "off";
    try {
      window.sessionStorage.setItem("mobile-gate-dismissed", "1");
    } catch {
      // Without storage the gate simply reappears on the next page load.
    }
  };

  return (
    <section
      className="mobile-gate"
      data-dismissed={dismissed ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile support notice"
    >
      <p className="mobile-gate__meta">
        <span>Brandon Aris Chen</span>
        <span>Portfolio</span>
      </p>
      <div className="mobile-gate__message">
        <strong>
          This site does not support mobile phones yet.
        </strong>
        <p>Please visit again on a desktop browser for the full experience.</p>
      </div>
      <button className="mobile-gate__enter" type="button" onClick={enterAnyway}>
        Still enter
      </button>
    </section>
  );
}
