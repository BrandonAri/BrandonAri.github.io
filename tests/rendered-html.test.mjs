import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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

test("server-renders Brandon's engineering portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Brandon Chen — Electronics &amp; Controls<\/title>/i);
  assert.match(html, /I build, measure/);
  assert.match(html, /Smartify appliance retrofit/);
  assert.match(html, /Vehicle electrical teardown/);
  assert.match(html, /Controllable movement study/);
  assert.match(html, /Command path/);
  assert.match(html, /Test record/);
  assert.match(html, /Revision log/);
  assert.match(html, /Recorded evidence/);
});

test("ships project evidence and accessible media descriptions", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /alt="Open appliance chassis showing/);
  assert.match(html, /alt="Vehicle interior with side trim removed/);
  assert.match(html, /alt="Unreal Engine showing/);
  assert.match(html, /poster="\/media\/smartify-demo-poster.jpeg"/);
  assert.match(html, /poster="\/media\/car-repair-poster.jpeg"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|_sites-preview/);
});
