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
  assert.match(projects, /lastTriggerRef\.current\?\.focus\(\)/);
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
  assert.match(masthead, /className="hero__photo"/);
  assert.match(masthead, /className="hero__shade"/);
  assert.match(masthead, /Hardware engineer\./);
  assert.match(masthead, /App developer\./);
  assert.match(masthead, /PM\./);
  assert.match(masthead, /portrait-light-scan\.jpeg/);
  assert.match(css, /\.nav\s*\{[\s\S]*?mix-blend-mode:\s*difference/);
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
  assert.doesNotMatch(css, /animation:\s*[^;]*infinite/);
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
  assert.match(masthead, /const roleLag = Math\.max\([\s\S]*?-metrics\.stageHeight \* 0\.1,[\s\S]*?displayVelocity \* 0\.035/);
  assert.match(masthead, /travelled - roleLag/);
  assert.match(masthead, /roleEnd: backgroundLength/);
  assert.match(masthead, /roleStart: 0/);
  assert.match(masthead, /applyRoleMotion\(roleProgress\)/);
  assert.match(masthead, /aria-label="Hardware engineer\. App developer\. PM\."/);
  assert.match(masthead, /mixRgb\(\[17, 18, 21\], \[243, 244, 241\], backgroundProgress\)/);
  assert.match(masthead, /mixRgb\(\[243, 238, 229\], \[23, 26, 25\], backgroundProgress\)/);
  assert.match(masthead, /whiteIntro\.inert = crossProgress < 0\.995/);
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
  assert.match(css, /--white-intro-panel-y:\s*100svh/);
  assert.doesNotMatch(css, /--hero-foreground-y|--white-intro-y/);
  assert.doesNotMatch(css, /\.white-intro__inner\s*\{[^}]*transform:/);
  assert.doesNotMatch(css, /mask-image/);
  assert.doesNotMatch(css, /--hero-foreground-opacity/);
  assert.doesNotMatch(css, /--white-intro-opacity/);
  assert.doesNotMatch(css, /\.white-intro__inner\s*\{[^}]*opacity:/);
  assert.doesNotMatch(css, /transition:\s*color/);
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
  const [masthead, css] = await Promise.all([
    readFile(new URL("../app/masthead.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

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
  assert.match(css, /\.hero__name-track[\s\S]*?will-change:\s*transform/);
  assert.doesNotMatch(css, /\.hero__name\s*\{[^}]*opacity:/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.menu-toggle[\s\S]*?display:\s*grid/);
});

test("uses velocity-aware critical damping for consistent scroll resistance", async () => {
  const masthead = await readFile(
    new URL("../app/masthead.tsx", import.meta.url),
    "utf8",
  );

  assert.match(masthead, /const rawVelocitySample = \(targetTravel - previousTarget\) \/ deltaTime/);
  assert.match(masthead, /56 \+ absoluteRawVelocity \* 0\.13/);
  assert.match(masthead, /metrics\.stageHeight \* 0\.18/);
  assert.match(masthead, /const decay = Math\.exp\(-omega \* deltaTime\)/);
  assert.match(masthead, /displayTravel =\s*targetTravel \+ \(delta \+ velocityStep\) \* decay/);
  assert.match(masthead, /openingTravelRef\.current = travelled/);
  assert.match(masthead, /openingVelocityRef\.current = displayVelocity/);
  assert.match(masthead, /Math\.abs\(targetTravel - displayTravel\) >= 0\.12/);
});
