import assert from "node:assert/strict";
import test from "node:test";

test("wedding invitation source contains the primary interaction copy", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /輕拉切換，拉到底展開內容/);
  assert.match(source, /誠摯邀請你/);
  assert.match(source, /orientation-note/);
});
