type SavedStyles = {
  body: {
    overflow: string;
    overscrollBehavior: string;
  };
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  restoreScroll: boolean;
  scrollY: number;
};

let lockCount = 0;
let savedStyles: SavedStyles | null = null;

export function lockPageScroll({ restoreScroll = true } = {}) {
  lockCount += 1;

  if (lockCount === 1) {
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    savedStyles = {
      body: {
        overflow: body.style.overflow,
        overscrollBehavior: body.style.overscrollBehavior,
      },
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      restoreScroll,
      scrollY,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
  } else if (savedStyles && !restoreScroll) {
    savedStyles.restoreScroll = false;
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount !== 0 || !savedStyles) return;

    const body = document.body;
    const html = document.documentElement;
    const restore = savedStyles;
    savedStyles = null;

    html.style.overflow = restore.htmlOverflow;
    html.style.overscrollBehavior = restore.htmlOverscrollBehavior;
    body.style.overflow = restore.body.overflow;
    body.style.overscrollBehavior = restore.body.overscrollBehavior;
    if (restore.restoreScroll) {
      window.scrollTo({
        behavior: "instant",
        left: 0,
        top: restore.scrollY,
      });
    }
  };
}
