# Brandon Chen Portfolio — Working Notes

Production: https://brandonaris.com — deployed by GitHub Pages on every push to
`main` (`.github/workflows/pages.yml`). Repo: `BrandonAri/BrandonAri.github.io`.

## Workflow rules (from Brandon — follow every session)

1. **Backup first.** Before starting any new fix or feature, create a backup
   branch of the current state: `git branch backup/YYYY-MM-DD-<short-desc>`.
   This is the restore point. To roll production back:
   `git reset --hard <backup-branch> && git push --force-with-lease origin main`.
2. **Never change the desktop presentation.** Desktop layout, timing, and
   motion are approved as-is. Mobile-only work belongs inside the
   `@media (max-width: 620px) and (orientation: portrait)` breakpoint.
3. **Push when done.** After tests and runtime validation pass, commit and push
   `main` so the fix actually reaches the site, then verify the live site
   (asset hash changes at `assets/index-*.css`). Don't leave validated work
   sitting local — Brandon expects the site to update.
4. **Don't claim mobile/iOS is fixed from screenshots.** Validate with
   continuous frame/position sampling (Playwright WebKit) and say plainly that
   final confirmation needs Brandon's phone.
5. Mobile is served directly again. Do not reintroduce an opaque fixed mobile
   gate or paint the root canvas to imitate Safari's toolbar background.
6. Never stage/delete/publish `public/media/brandon-portrait-dark.jpeg`
   (untracked on purpose).

## Commands

- `npm test` — full static build (`vinext build` + `scripts/postbuild-static.mjs`)
  then `node --test tests/rendered-html.test.mjs`. Build output: `dist/client`.
- `npm run lint` — must stay at 0 errors (the 10 `<img>` warnings are known).
- Local check: `python3 -m http.server 8213 -d dist/client` and drive it with
  Playwright WebKit (installed in the session scratchpad, not in this repo).

## Architecture gotchas (things that already caused bugs)

- **Navigation is MPA, not SPA.** In this static export, `router.push` is a
  full document load; React state does not survive route changes (`.rsc`
  requests in traces are just link prefetch). Any cross-page continuity must
  go through `sessionStorage` plus the pre-paint inline script in
  `app/layout.tsx` (`prePaintState`), which stamps `data-*` attributes on
  `<html>` before first paint.
- **Page transition** (`app/page-transition.tsx`): cover animation plays on
  the departing page → it sets `sessionStorage["pt-reveal"]` → destination's
  first paint stays covered via `html[data-pt-reveal] .page-transition-layer`
  CSS → provider resumes and plays the reveal. Scroll is locked only during
  the `covering` phase (locking on the destination would break anchors).
- **Scroll restore must be instant.** `html { scroll-behavior: smooth }` turns
  any plain `window.scrollTo` into an animated scroll (this was the
  "sheet close scrolls down from the top" bug). `app/scroll-lock.ts` restores
  with `behavior: "instant"`; do the same for any programmatic restore.
- **Cross-page anchors** (`/#experience`): the browser anchor-scrolls before
  the masthead measures its real height, so `restoreAnchorTarget()` in
  `app/masthead.tsx` re-anchors once after the first measure.
- **Masthead opening transition**: desktop = sticky `.masthead-stage` with
  JS-driven transforms (do not touch). Mobile portrait = native scrolling:
  static stage spanning the sequence, `position: sticky` hero, white intro at
  the sequence bottom, JS transforms neutralized by CSS. On mobile,
  `crossLength` must equal exactly one `stageHeight` and `stageHeight` is
  measured from `hero.clientHeight`, so the JS timeline (inert release, nav
  tone) stays 1:1 with the native geometry.
- **Project sheet** (`app/project-archive.tsx`): keep the opaque light
  `.project-sheet__scroller` and its overscroll protection — it prevents dark
  flashes during iOS overscroll.

## Mobile Safari root scrolling

Phones use the document root as the scroll container. At the portrait mobile
breakpoint, `html` and `body` keep visible overflow and transparent backgrounds;
horizontal clipping belongs to the normal-flow `.site-document` instead. Do
not add a fixed full-screen app wrapper or a colored root-canvas workaround.
`app/mobile-gate.tsx` is retained only as unused history and is not rendered.

## Tests

`tests/rendered-html.test.mjs` renders the exported pages **and** pins source
files (`masthead.tsx`, `globals.css`, etc.) with regexes. When intentionally
changing behavior, update the pins and add new ones for the new behavior —
that is this suite's regression style.

## Backups

- `backup/2026-07-13-before-fixes` — state before the sheet-close/transition
  fixes and mobile gate (also tag `backup-2026-07-13`).
- `backup/2026-07-13-deployed-fixes` — state deployed on 2026-07-13
  (commit `a0ff728`).
- `backup/2026-07-13-before-safari-root-hover-sheet` — restore point before
  normal mobile-root scrolling, deterministic name hover, and project-sheet
  lock hardening.
