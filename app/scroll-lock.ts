type SavedStyles = {
  body: {
    left: string;
    overflow: string;
    position: string;
    right: string;
    top: string;
    width: string;
  };
  htmlOverflow: string;
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
        left: body.style.left,
        overflow: body.style.overflow,
        position: body.style.position,
        right: body.style.right,
        top: body.style.top,
        width: body.style.width,
      },
      htmlOverflow: html.style.overflow,
      restoreScroll,
      scrollY,
    };

    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.right = "0";
    body.style.left = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
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
    body.style.position = restore.body.position;
    body.style.top = restore.body.top;
    body.style.right = restore.body.right;
    body.style.left = restore.body.left;
    body.style.width = restore.body.width;
    body.style.overflow = restore.body.overflow;
    if (restore.restoreScroll) {
      window.scrollTo({
        behavior: "instant",
        left: 0,
        top: restore.scrollY,
      });
    }
  };
}
