import assert from "node:assert/strict";
import test from "node:test";

test("v0.2 about-us ribbon contains bilingual copy and reveal interaction", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /輕拉切換，拉到底展開內容/);
  assert.match(source, /關於我們/);
  assert.match(source, /Two people with different rhythms/);
  assert.match(source, /about-photo-reveal/);
  assert.match(source, /src="about-us\.jpg"/);
  assert.match(source, /冠禎 &amp; 玟慧/);
  assert.match(source, /orientation-note/);
});
