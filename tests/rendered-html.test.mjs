import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: {
        accept: "text/html",
        host: "localhost",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("serves About as a dedicated page instead of an existing section anchor", async () => {
  const response = await render("/about/");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /<title>About — In Development \| Brandon Aris Chen<\/title>/i);
  assert.match(html, /Still building/);
  assert.match(html, /this page\./);
  assert.match(html, /In development/);
  assert.doesNotMatch(html, /Engineering approach|Technical foundation|Product work/);
  assert.match(html, /class="nav"/);
  assert.match(html, /href="\/about"/);
  assert.match(html, /href="\/\#experience"/);
  assert.match(html, /href="\/\#work"/);
  assert.match(html, /href="\/\#contact"/);
  assert.doesNotMatch(html, /Syntexis/i);
});

test("server-renders the verified professional introduction and timeline", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Brandon Chen — Electronics &amp; Controls<\/title>/i);
  assert.match(html, /Bachelor of Engineering Technology/);
  assert.match(html, /Electronics &amp; Controls/);
  assert.match(html, /Cape Breton University/);
  assert.match(html, /Hardware engineer\./);
  assert.match(html, /App developer\./);
  assert.match(html, /Brandon Aris Chen/);
  assert.match(html, /I develop practical systems where electronics/);
  assert.match(html, /device-sensor integration/);
  assert.match(html, /Applied Engineering Intern/);
  assert.match(html, /Syntaxis Ltd\./);
  assert.doesNotMatch(html, /Syntexis/i);
  assert.match(html, /Apr 30, 2026 — Present/);
  assert.match(html, /nRF52840/);
  assert.match(html, /Rotary Ribfest/);
  assert.match(html, /Academic &amp; professional development/);
  assert.match(html, /src="\/media\/portrait-light-scan\.jpeg"/);
  assert.match(html, /href="mailto:xz1919810@gmail\.com"/);
  assert.match(html, /href="mailto:brandon@syntaxis\.digital"/);
  assert.doesNotMatch(html, /Engineering technology portfolio \/ 2026/i);
  assert.doesNotMatch(html, /Education · Hardware · Product/);
  assert.doesNotMatch(html, />BC</);
});

test("renders only approved public project cards", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /ESP32 Space-Heater Control Retrofit/);
  assert.match(html, /Vehicle SRS &amp; Steering Repair/);
  assert.match(html, /Selected engineering projects/);
  assert.match(html, /Embedded control and automotive repair/);
  assert.match(html, /aria-haspopup="dialog"/);
  assert.doesNotMatch(html, /Open a project to review the engineering record/i);
  assert.doesNotMatch(html, /Controllable movement study|Digital motion|Unreal Engine/i);
});

test("links every visible university and company reference to its official website", async () => {
  const response = await render();
  const html = await response.text();

  assert.equal((html.match(/href="https:\/\/www\.cbu\.ca\/"/g) ?? []).length, 4);
  assert.equal((html.match(/href="https:\/\/syntaxis\.digital\/"/g) ?? []).length, 3);
  assert.match(html, /href="https:\/\/www\.cbu\.ca\/"[^>]*>\s*Cape Breton University\s*<\/a>/);
  assert.match(html, /href="https:\/\/syntaxis\.digital\/"[^>]*>\s*Syntaxis Ltd\.\s*<\/a>/);
});

test("keeps confidential motion material out of source and public assets", async () => {
  const [page, projects] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/project-archive.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /unreal|motion-system/i);
  assert.doesNotMatch(projects, /unreal|motion-system/i);
  await assert.rejects(
    access(new URL("../public/media/unreal-motion-system.jpeg", import.meta.url)),
  );
});

test("includes draggable project sheets and corrected repair evidence", async () => {
  const [projects, css] = await Promise.all([
    readFile(new URL("../app/project-archive.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(projects, /onPointerDown=\{beginDrag\}/);
  assert.match(projects, /Drag down to close project/);
  assert.match(projects, /type SheetPhase = "opening" \| "open" \| "closing"/);
  assert.match(projects, /setSheetPhase\("closing"\)/);
  assert.match(projects, /onTransitionEnd=\{finishCloseOnTransition\}/);
  assert.match(projects, /"--sheet-drag-y": `\$\{dragOffset\}px`/);
  assert.match(projects, /window\.addEventListener\("pointercancel", cancelDrag\)/);
  assert.match(projects, /lastTriggerRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(projects, /const unlockPageScroll = lockPageScroll\(\)/);
  assert.match(projects, /className="project-sheet__scroller"/);
  assert.match(css, /\.project-sheet__scroller\s*\{[\s\S]*?-webkit-overflow-scrolling:\s*touch[\s\S]*?touch-action:\s*pan-y/);
  assert.match(css, /\.project-sheet\.is-opening,[\s\S]*?\.project-sheet\.is-closing[\s\S]*?translate3d\(0, 105%, 0\)/);
  assert.match(css, /\.sheet-layer\.is-closing[\s\S]*?pointer-events:\s*none/);
  assert.match(css, /\.sheet-layer\.is-opening \.sheet-backdrop,[\s\S]*?\.sheet-layer\.is-closing \.sheet-backdrop[\s\S]*?opacity:\s*0/);
  assert.match(projects, /IR receiver signal path/);
  assert.match(projects, /Two pretensioners replaced/);
  assert.match(projects, /Inner tie rod replaced/);
  assert.match(projects, /car-seatbelts\.jpeg/);
  assert.match(projects, /car-dash-teardown\.jpeg/);
});

test("copies only the referenced top bar and rolling-name banner", async () => {
  const [page, masthead, topNav, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/top-nav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<Masthead \/>/);
  assert.doesNotMatch(page, /AdaptiveHeader|data-header-tone/);
  assert.match(masthead, /<TopNav \/>/);
  assert.match(topNav, />Brandon Aris Chen</);
  assert.match(topNav, /href="\/about"[\s\S]*?>\s*About\s*<\/TransitionLink>/);
  assert.match(topNav, /href="\/\#experience"/);
  assert.doesNotMatch(topNav, /nav__dot/);
  assert.match(topNav, /className="nav__bar"/);
  assert.match(topNav, /data-tone=\{tone\}/);
  assert.match(masthead, /className="hero__photo"/);
  assert.match(masthead, /className="hero__shade"/);
  assert.match(masthead, /Hardware engineer\./);
  assert.match(masthead, /App developer\./);
  assert.match(masthead, /PM\./);
  assert.match(masthead, /portrait-light-scan\.jpeg/);
  assert.doesNotMatch(css, /\.nav\s*\{[^}]*mix-blend-mode:/);
  assert.doesNotMatch(css, /backdrop-filter|glass/);
  assert.match(css, /\.nav__brand,\s*\.menu-toggle\s*\{[\s\S]*?background:\s*#17191d/);
  assert.doesNotMatch(css, /\.nav__dot/);
  assert.match(css, /\.hero,\s*\.white-intro\s*\{[\s\S]*?min-height:\s*100svh/);
  assert.doesNotMatch(css, /min-height:\s*(?:108|115)svh/);
  assert.match(css, /object-position:\s*50% 42%/);
  assert.match(css, /\.hero__name span[\s\S]*?font-size:\s*clamp\(5\.2rem, 10\.8vw, 12\.5rem\)/);
  await access(new URL("../public/media/portrait-light-scan.jpeg", import.meta.url));
  await assert.rejects(
    access(new URL("../app/adaptive-header.tsx", import.meta.url)),
  );
});

test("transitions between the portfolio and About before switching routes", async () => {
  const [about, layout, masthead, transition, css] = await Promise.all([
    readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page-transition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(about, /import \{ TopNav \} from "\.\.\/top-nav"/);
  assert.match(about, /<TopNav \/>/);
  assert.match(masthead, /<TopNav \/>/);
  assert.match(layout, /<PageTransitionProvider>\{children\}<\/PageTransitionProvider>/);
  assert.match(about, /<TransitionLink href="\/">/);
  assert.match(about, /Still building/);
  assert.match(about, /In development/);
  assert.doesNotMatch(about, /Engineering approach|Technical foundation|Product work/);
  assert.doesNotMatch(about, /about-placeholder__wipe/);
  assert.match(transition, /type TransitionPhase = "idle" \| "covering" \| "holding" \| "revealing"/);
  assert.match(transition, /if \(phase === "covering"\)[\s\S]*?setPhase\("holding"\)[\s\S]*?router\.push\(targetHrefRef\.current\)/);
  assert.match(transition, /phase !== "holding" \|\| pathname !== targetPathRef\.current/);
  assert.match(transition, /setPhase\("revealing"\)/);
  assert.match(css, /\.page-transition-layer\.is-covering[\s\S]*?animation:\s*page-transition-cover/);
  assert.match(css, /\.page-transition-layer\.is-revealing[\s\S]*?animation:\s*page-transition-reveal/);
  assert.match(css, /@keyframes page-transition-cover/);
  assert.match(css, /@keyframes page-transition-reveal/);
  assert.doesNotMatch(css, /about-placeholder-wipe|about-placeholder-enter/);
});

test("reveals Xuze only while the large profile name is hovered or focused", async () => {
  const [masthead, css] = await Promise.all([
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(masthead, /className="profile-name-swap"/);
  assert.match(masthead, /className="profile-name-swap__default">Brandon</);
  assert.match(masthead, /className="profile-name-swap__alternate">\(Xuze\)</);
  assert.match(masthead, /aria-label="Brandon Chen\. Hover to reveal Xuze Chen\."/);
  assert.match(css, /\.profile-name-swap__alternate\s*\{[\s\S]*?opacity:\s*0[\s\S]*?translate3d\(0, 105%, 0\)/);
  assert.match(css, /\.profile-name-swap:hover \.profile-name-swap__default/);
  assert.match(css, /\.profile-name-swap:hover \.profile-name-swap__alternate/);
  assert.match(css, /\.profile-name-swap:focus-visible \.profile-name-swap__default/);
  assert.match(css, /\.profile-name-swap:focus-visible \.profile-name-swap__alternate/);
  assert.match(masthead, /if \(crossProgress > 0\.02\) setWhiteIntroInert\(false\)/);
  assert.match(masthead, /else if \(crossProgress <= 0\) setWhiteIntroInert\(true\)/);
  assert.doesNotMatch(
    css,
    /\.profile-name-swap[^\{]*\{[^}]*animation:/,
  );
});

test("orders the opening transition without a dead white interval", async () => {
  const [masthead, css] = await Promise.all([
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(masthead, /className="masthead-sequence"/);
  assert.match(masthead, /className="masthead-stage"/);
  assert.match(masthead, /className="hero__background-layer"/);
  assert.match(
    masthead,
    /className="hero__foreground-layer"[\s\S]*?className="hero__role"[\s\S]*?className="hero__name"/,
  );
  assert.match(masthead, /className="white-intro"/);
  assert.match(masthead, /Electronics &amp; Controls · Hardware Development/);
  assert.match(masthead, /I develop practical systems where electronics/);
  assert.match(masthead, /const backgroundProgress = linearProgress\([\s\S]*?metrics\.backgroundEnd,[\s\S]*?travelled/);
  assert.match(masthead, /const crossProgress = linearProgress\([\s\S]*?metrics\.crossStart,[\s\S]*?metrics\.crossEnd/);
  assert.match(masthead, /const roleProgress = linearProgress\([\s\S]*?metrics\.roleStart,[\s\S]*?metrics\.roleEnd/);
  assert.doesNotMatch(masthead, /roleLag|displayVelocity/);
  assert.match(masthead, /metrics\.roleEnd,[\s\S]*?travelled/);
  assert.match(masthead, /roleEnd: backgroundLength/);
  assert.match(masthead, /roleStart: 0/);
  assert.match(masthead, /applyRoleMotion\(roleProgress\)/);
  assert.match(masthead, /aria-label="Hardware engineer\. App developer\. PM\."/);
  assert.match(masthead, /mixRgb\(\[17, 18, 21\], \[243, 244, 241\], backgroundProgress\)/);
  assert.match(masthead, /mixRgb\(\[243, 238, 229\], \[23, 26, 25\], backgroundProgress\)/);
  assert.doesNotMatch(masthead, /setWhiteIntroInert\(crossProgress < 0\.995\)/);
  assert.match(masthead, /const crossStart = exitEnd/);
  assert.match(masthead, /const crossEnd = crossStart \+ crossLength/);
  assert.match(masthead, /--hero-frame-y/);
  assert.match(masthead, /--white-intro-panel-y/);
  assert.doesNotMatch(masthead, /blankLength|blankEnd|introStart|introEnd/);
  assert.match(masthead, /sequence\.style\.height = `\$\{totalTravel \+ stageHeight\}px`/);
  assert.match(css, /\.masthead-sequence\s*\{[\s\S]*?height:\s*440svh/);
  assert.match(css, /\.masthead-stage\s*\{[\s\S]*?position:\s*sticky/);
  assert.match(css, /\.masthead-stage\s*\{[\s\S]*?background:\s*var\(--opening-background\)/);
  assert.match(css, /\.hero__background-layer[\s\S]*?opacity:\s*var\(--hero-background-opacity\)/);
  assert.match(css, /\.hero\s*\{[\s\S]*?transform:\s*translate3d\(0, var\(--hero-frame-y\), 0\)/);
  assert.match(css, /\.hero__role h1 span\s*\{[\s\S]*?width:\s*max-content[\s\S]*?transform-origin:\s*left top[\s\S]*?will-change:\s*transform/);
  assert.match(css, /\.white-intro\s*\{[\s\S]*?background:\s*var\(--canvas\)[\s\S]*?transform:\s*translate3d\(0, var\(--white-intro-panel-y\), 0\)/);
  assert.match(css, /--white-intro-panel-y:\s*100dvh/);
  assert.doesNotMatch(css, /--hero-foreground-y|--white-intro-y/);
  assert.doesNotMatch(css, /\.white-intro__inner\s*\{[^}]*transform:/);
  assert.doesNotMatch(css, /mask-image/);
  assert.doesNotMatch(css, /--hero-foreground-opacity/);
  assert.doesNotMatch(css, /--white-intro-opacity/);
  assert.doesNotMatch(css, /\.white-intro__inner\s*\{[^}]*opacity:/);
  assert.doesNotMatch(css, /\.hero\s*\{[^}]*transition:\s*color/);
  assert.doesNotMatch(masthead, /PortraitReveal|brandon-portrait\.jpeg/);
  assert.match(css, /\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.hero__role h1 span\s*\{[\s\S]*?transform:\s*none !important/);
  await assert.rejects(
    access(new URL("../public/media/brandon-portrait.jpeg", import.meta.url)),
  );
});

test("uses one shared left-aligned heading system without forced desktop breaks", async () => {
  const [page, projects, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/project-archive.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /section-heading-stacked experience-heading/);
  assert.match(projects, /section-heading-stacked work-heading/);
  assert.doesNotMatch(projects, /Selected engineering\s*<br\s*\/>/);
  assert.doesNotMatch(page, /Degree and work progressing in parallel/);
  assert.match(css, /\.section-heading-stacked h2[\s\S]*?white-space:\s*nowrap/);
});

test("keeps the rolling name moving at idle and reverses with scroll direction", async () => {
  const [layout, masthead, css] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /import \{ Geist, Geist_Mono, Instrument_Sans \} from "next\/font\/google"/);
  assert.match(layout, /variable:\s*"--font-instrument-sans"/);
  assert.match(layout, /\$\{instrumentSans\.variable\}/);
  assert.match(masthead, /Array\.from\(\{ length: 8 \}/);
  assert.match(masthead, /const idleNameSpeed = 42/);
  assert.match(masthead, /const maximumScrollNameSpeed = 1000/);
  assert.match(masthead, /const scrollBoostHold = 90/);
  assert.match(masthead, /const scrollSettleDuration = 950/);
  assert.match(masthead, /let speed = idleNameSpeed/);
  assert.match(masthead, /direction = delta > 0 \? 1 : -1/);
  assert.match(masthead, /const directSpeed = 130 \+ Math\.abs\(delta\) \* 5/);
  assert.match(masthead, /const carriedSpeed = Math\.abs\(speed\) \+ Math\.abs\(delta\) \* 2/);
  assert.match(masthead, /settleProgress \* settleProgress \* \(3 - 2 \* settleProgress\)/);
  assert.match(masthead, /accelerating \? 12 : 3\.4/);
  assert.match(masthead, /span\.hidden = index >= visibleNameCount/);
  assert.match(masthead, /visibleNameCount \* unitWidth \+ Math\.max\(24, window\.innerWidth \* 0\.02\)/);
  assert.match(masthead, /const updateMarqueeSpeed = \(now: number, deltaTime: number\)/);
  assert.match(masthead, /phase \+ speed \* deltaTime/);
  assert.match(masthead, /const exitProgress = linearProgress\([\s\S]*?timelineMetricsRef\.current\.exitStart,[\s\S]*?timelineMetricsRef\.current\.exitEnd/);
  assert.match(masthead, /\(exitEndPhase - exitStartPhase\) \* exitProgress/);
  assert.doesNotMatch(masthead, /exitScrollDistance|exitScrollStart|marqueeScrollRatio|marqueeResetPadding/);
  assert.doesNotMatch(masthead, /normalizedExitProgress|exitCurveAtEntry/);
  assert.match(masthead, /requestAnimationFrame\(frame\)/);
  assert.match(masthead, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.hero__name\s*\{[\s\S]*?font-family:\s*var\(--font-instrument-sans\), var\(--font-geist-sans\), Arial, sans-serif[\s\S]*?font-weight:\s*500[\s\S]*?letter-spacing:\s*-0\.04em/);
  assert.match(css, /\.hero__name-track[\s\S]*?will-change:\s*transform/);
  assert.doesNotMatch(css, /\.hero__name\s*\{[^}]*opacity:/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.menu-toggle[\s\S]*?display:\s*grid/);
});

test("shows a self-contrasting breathing cue on the opening screen", async () => {
  const [masthead, css] = await Promise.all([
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(masthead, /className="masthead-scroll-origin"[\s\S]*?ref=\{scrollOriginRef\}/);
  assert.match(masthead, /className="hero__scroll-cue"[\s\S]*?data-hidden="false"[\s\S]*?ref=\{scrollCueRef\}[\s\S]*?className="hero__scroll-cue-motion"[\s\S]*?<Arrow direction="down" \/>/);
  assert.match(masthead, /new IntersectionObserver\(\(\[entry\]\) => \{\s*setHidden\(!entry\.isIntersecting\)/);
  assert.match(css, /\.hero__scroll-cue\s*\{[\s\S]*?bottom:\s*calc\(4\.5vh \+ clamp\(4\.5rem, 9\.3vw, 10\.75rem\) \+ 1\.4rem\)[\s\S]*?color:\s*#fff[\s\S]*?font-size:\s*clamp\(1\.9rem, 2\.6vw, 2\.5rem\)[\s\S]*?mix-blend-mode:\s*difference[\s\S]*?opacity:\s*1[\s\S]*?translate3d\(-50%, 0, 0\)/);
  assert.match(css, /\.hero__scroll-cue\[data-hidden="true"\]\s*\{[\s\S]*?visibility:\s*hidden[\s\S]*?opacity:\s*0/);
  assert.match(css, /\.hero__scroll-cue-motion\s*\{[\s\S]*?animation:\s*scroll-cue-breathe 2\.4s ease-in-out infinite/);
  assert.match(css, /\.hero__scroll-cue \.ui-arrow::before\s*\{[\s\S]*?height:\s*2\.5px/);
  assert.match(css, /\.hero__scroll-cue \.ui-arrow::after\s*\{[\s\S]*?border-top-width:\s*2\.5px[\s\S]*?border-right-width:\s*2\.5px/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.hero__scroll-cue\s*\{[\s\S]*?bottom:\s*calc\(5vh \+ 14\.7vw \+ 1\.3rem\)/);
  assert.match(css, /@keyframes scroll-cue-breathe\s*\{[\s\S]*?translate3d\(0, -5px, 0\) scale\(0\.985\)[\s\S]*?translate3d\(0, 6px, 0\) scale\(1\.015\)/);
});

test("keeps the opening transition directly synchronized to scroll in both directions", async () => {
  const masthead = await readFile(
    new URL("../app/masthead.tsx", import.meta.url),
    "utf8",
  );

  assert.match(masthead, /const rawTravel = window\.scrollY - sequenceDocumentTop/);
  assert.match(masthead, /renderTimeline\(readTravel\(\)\)/);
  assert.match(masthead, /openingTravelRef\.current = travelled/);
  assert.match(masthead, /const totalTravel = crossEnd/);
  assert.doesNotMatch(masthead, /holdLength|displayTravel|velocityStep|const decay/);
});

test("keeps mobile Safari on the normal document scroller and hardens project sheets", async () => {
  const [layout, masthead, projects, page, about, topNav, scrollLock, arrow, css] =
    await Promise.all([
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/project-archive.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/about/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/top-nav.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/scroll-lock.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/arrow.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    ]);

  assert.match(layout, /viewportFit:\s*"cover"/);
  assert.doesNotMatch(layout, /themeColor|data-chrome-tone|data-canvas-tone/);
  assert.match(css, /env\(safe-area-inset-top/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(css, /@media \(max-width: 620px\) and \(orientation: portrait\)[\s\S]*?height:\s*100lvh/);
  assert.match(css, /html\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(css, /body\s*\{[\s\S]*?background:\s*var\(--canvas\)/);
  assert.match(masthead, /const mobilePortrait = window\.matchMedia/);
  assert.match(
    masthead,
    /if \(mobilePortrait\.matches\)\s*\{[\s\S]*?sequence\.style\.removeProperty\("height"\)[\s\S]*?roleMotionRef\.current = \[\][\s\S]*?whiteIntro\.inert = false;[\s\S]*?return;/,
  );
  assert.doesNotMatch(masthead, /const follow = 1 - Math\.exp|velocityStep|roleLag/);
  assert.match(masthead, /const crossLength = mobilePortrait\.matches\s*\?\s*stageHeight\s*:\s*stageHeight \* 0\.82/);
  assert.match(masthead, /mobilePortrait\.matches \? hero\.clientHeight : stage\.clientHeight/);
  assert.doesNotMatch(masthead, /window\.addEventListener\("touchmove", scheduleUpdate/);
  assert.match(masthead, /const currentOpeningTravel = \(\) =>/);
  assert.match(masthead, /const scheduleUpdate = \(\) => \{\s*if \(mobilePortrait\.matches\) return;/);
  assert.match(masthead, /const onResize = \(\) => \{\s*if \(mobilePortrait\.matches\)[\s\S]*?setWhiteIntroInert\(false\);[\s\S]*?return;/);
  assert.match(css, /\.profile-name-swap > span:last-child\s*\{[\s\S]*?padding-left:\s*0/);
  assert.match(projects, /className="project-sheet__scroller"/);
  assert.match(projects, /handle\.setPointerCapture\(pointerId\)/);
  assert.match(projects, /typeof handle\.setPointerCapture === "function"/);
  assert.match(projects, /typeof handle\.hasPointerCapture === "function"/);
  assert.match(projects, /lostpointercapture/);
  assert.match(projects, /unlockPageScrollRef\.current\?\.\(\)/);
  assert.match(scrollLock, /let lockCount = 0/);
  assert.doesNotMatch(scrollLock, /body\.style\.position = "fixed"/);
  assert.doesNotMatch(scrollLock, /body\.style\.top/);
  assert.match(scrollLock, /html\.style\.overflow = "hidden"/);
  assert.match(scrollLock, /lockCount = Math\.max\(0, lockCount - 1\)/);
  assert.match(topNav, /portfolio-theme-progress/);
  assert.doesNotMatch(topNav, /canvasTone|theme-color/);
  assert.match(topNav, /data-at-top="true"/);
  assert.match(topNav, /data-surface="false"/);
  assert.match(topNav, /data-visible="true"/);
  assert.match(topNav, /directionalTravel > 18/);
  assert.match(topNav, /window\.addEventListener\("touchmove", onTouchMove/);
  assert.match(topNav, /ignoreScrollDirectionUntil = performance\.now\(\) \+ 1200/);
  assert.doesNotMatch(css, /backdrop-filter|glass|conic-gradient/);
  assert.match(css, /\.nav\[data-at-top="true"\] \.nav__brand[\s\S]*?background:\s*transparent/);
  assert.match(css, /@media \(max-width: 620px\) and \(orientation: portrait\)[\s\S]*?\.nav__brand,[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent/);
  assert.match(css, /\.nav\[data-visible="false"\] \.nav__brand[\s\S]*?translate3d\(0, -135%, 0\)/);
  assert.match(css, /\.project-sheet__scroller\s*\{[\s\S]*?overscroll-behavior-y:\s*none[\s\S]*?background:\s*var\(--canvas\)/);
  assert.match(css, /\.project-sheet\s*\{[\s\S]*?height:\s*min\(calc\(100vh[\s\S]*?height:\s*min\(calc\(100dvh/);
  assert.match(css, /\.project-sheet__scroller\s*\{[\s\S]*?min-height:\s*0/);
  assert.match(css, /\.project-sheet\.is-open:not\(\.is-dragging\)[\s\S]*?will-change:\s*auto/);
  assert.match(css, /\.orientation-guard\s*\{[\s\S]*?display:\s*none/);
  assert.match(css, /\(orientation: landscape\)[\s\S]*?\(pointer: coarse\)[\s\S]*?\.orientation-guard/);
  assert.match(layout, /Rotate your phone upright\./);
  assert.match(arrow, /ui-arrow--\$\{direction\}/);
  assert.doesNotMatch(
    [masthead, projects, page, about].join("\n"),
    /[↗↘→↓↑]/,
  );

  const exportedHome = await readFile(
    new URL("../dist/client/index.html", import.meta.url),
    "utf8",
  );
  assert.match(exportedHome, /viewport-fit=cover/);
});

test("finishes the reveal half of page transitions across full document loads", async () => {
  const [transition, layout, css] = await Promise.all([
    readFile(new URL("../app/page-transition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(transition, /const revealFlag = "pt-reveal"/);
  assert.match(transition, /sessionStorage\.setItem\(revealFlag, "1"\)/);
  assert.match(transition, /if \(!document\.documentElement\.dataset\.ptReveal\) return/);
  assert.match(transition, /targetPathRef\.current = pathname;\s*setPhase\("holding"\)/);
  assert.match(transition, /phase !== "covering"/);
  assert.match(transition, /max-width: 620px[\s\S]*?orientation: portrait/);
  assert.match(transition, /return lockPageScroll\(\{ restoreScroll: false \}\)/);
  assert.match(transition, /event\.persisted/);
  assert.match(layout, /prePaintState/);
  assert.match(layout, /sessionStorage\.getItem\("pt-reveal"\)/);
  assert.match(css, /html\[data-pt-reveal\] \.page-transition-layer\s*\{[\s\S]*?visibility:\s*visible[\s\S]*?transform:\s*translate3d\(0, 0, 0\)/);

  const masthead = await readFile(
    new URL("../app/masthead.tsx", import.meta.url),
    "utf8",
  );
  assert.match(masthead, /const restoreAnchorTarget = \(\) =>/);
  assert.match(masthead, /scrollIntoView\(\{ behavior: "instant", block: "start" \}\)/);
});

test("restores the page position instantly when a project sheet closes", async () => {
  const scrollLock = await readFile(
    new URL("../app/scroll-lock.ts", import.meta.url),
    "utf8",
  );

  assert.match(scrollLock, /behavior:\s*"instant"/);
  assert.doesNotMatch(scrollLock, /window\.scrollTo\(0, restore\.scrollY\)/);
});

test("serves the portfolio directly on phones without an opaque fixed gate", async () => {
  const layout = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(layout, /MobileGate/);
  assert.doesNotMatch(layout, /mobile-gate-dismissed/);
});

test("drives the mobile portrait opening transition with native sticky scrolling", async () => {
  const [masthead, css] = await Promise.all([
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const mobileBlock = css.slice(
    css.indexOf("@media (max-width: 620px) and (orientation: portrait)"),
    css.indexOf("@media (orientation: landscape) and (max-height: 620px)"),
  );

  assert.match(mobileBlock, /html,\s*body\s*\{[\s\S]*?overflow:\s*visible/);
  assert.match(mobileBlock, /html\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(mobileBlock, /body\s*\{[\s\S]*?background:\s*transparent/);
  assert.doesNotMatch(mobileBlock, /html\s*\{[^}]*background:\s*#111215/);
  assert.match(mobileBlock, /\.site-document\s*\{[\s\S]*?overflow-x:\s*clip/);
  assert.match(mobileBlock, /\.masthead-sequence\s*\{[\s\S]*?height:\s*auto !important/);
  assert.match(mobileBlock, /\.masthead-stage\s*\{[\s\S]*?position:\s*relative[\s\S]*?height:\s*auto[\s\S]*?overflow:\s*visible/);
  assert.match(mobileBlock, /\.hero\s*\{[\s\S]*?position:\s*sticky[\s\S]*?top:\s*0[\s\S]*?transform:\s*none !important/);
  assert.match(mobileBlock, /\.white-intro\s*\{[\s\S]*?position:\s*relative[\s\S]*?margin-top:\s*46svh[\s\S]*?transform:\s*none !important/);
  assert.match(mobileBlock, /\.white-intro::before\s*\{[\s\S]*?height:\s*46svh[\s\S]*?linear-gradient/);
  assert.match(mobileBlock, /\.hero__name-track\s*\{[\s\S]*?animation:\s*mobile-name-roll 6\.5s linear infinite/);
  assert.match(css, /@keyframes mobile-name-roll\s*\{[\s\S]*?translate3d\(-12\.5%, 0, 0\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.hero__name-track\s*\{[\s\S]*?animation:\s*none !important/);
  assert.doesNotMatch(mobileBlock, /--white-intro-panel-y/);

  assert.match(
    masthead,
    /if \(mobilePortrait\.matches\)\s*\{[\s\S]*?sequence\.style\.removeProperty\("height"\)[\s\S]*?whiteIntro\.inert = false;[\s\S]*?return;/,
  );
  assert.match(
    masthead,
    /if \(mobilePortrait\.matches\)\s*\{[\s\S]*?track\.style\.removeProperty\("transform"\)[\s\S]*?animationPlayState[\s\S]*?visibilityObserver\.observe\(hero\)[\s\S]*?return \(\) =>/,
  );
  assert.match(masthead, /const onMobileModeChange = \(\) => \{[\s\S]*?window\.cancelAnimationFrame\(frameId\)[\s\S]*?track\.style\.removeProperty\("transform"\)/);
  assert.doesNotMatch(masthead, /window\.addEventListener\("touchmove", scheduleUpdate/);
});
