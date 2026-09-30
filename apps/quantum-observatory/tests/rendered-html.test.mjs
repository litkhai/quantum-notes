import assert from "node:assert/strict";
import test from "node:test";

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const context = { waitUntil() {}, passThroughOnException() {} };

test("renders the Korean quantum observability lab", async () => {
  const app = await worker();
  const response = await app.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<html[^>]+lang="ko"/i);
  assert.match(html, /<title>Quantum Shot Observatory<\/title>/i);
  assert.match(html, /한 번의 측정은 우연이지만/);
  assert.match(html, /반복하면 변화가 보입니다/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("serves every query preset in sample mode without credentials", async () => {
  const app = await worker();
  const presets = [
    "summary", "distribution", "drift", "errors", "experiments",
    "degradation", "entropy",
  ];
  for (const preset of presets) {
    const response = await app.fetch(
      new Request(`http://localhost/api/query?preset=${preset}&experiment=latest`),
      env,
      context,
    );
    assert.equal(response.status, 200, preset);
    const payload = await response.json();
    assert.equal(payload.source, "sample", preset);
    assert.equal(payload.preset.id, preset);
    assert.ok(payload.data.length > 0, preset);
  }
});

test("exposes a Docker health endpoint", async () => {
  const app = await worker();
  const response = await app.fetch(
    new Request("http://localhost/api/health"),
    env,
    context,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "quantum-shot-observatory",
  });
});
