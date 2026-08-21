import assert from "node:assert/strict";
import test from "node:test";

test("v0.5 invitation preserves desktop proportions and adds mobile fullscreen", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /冠禎 <i>&amp;<\/i> 玟慧/);
  assert.doesNotMatch(source, /G <i>&amp;<\/i> W/);
  assert.match(source, /about-detail\.jpg/);
  assert.match(source, /about-band-\$\{index\}/);
  assert.match(source, /台南晶英酒店/);
  assert.match(source, /google\.com\/maps/);
  assert.match(source, /TWO FAMILIES, ONE CELEBRATION/);
  assert.match(source, /WEDDING_AT/);
  assert.match(source, /2026-12-12T18:00:00\+08:00/);
  assert.match(source, /legacy-photo-composition/);
  assert.match(source, /viewing-tip/);
  assert.match(source, /requestFullscreen/);
  assert.match(source, /mobile-fullscreen-toggle/);
  assert.match(source, /portraitScale/);
  assert.match(styles, /width: 1600px; height: 900px/);
  assert.match(styles, /aspect-ratio: 3 \/ 2/);
  assert.match(styles, /\.detail-cord \{ position: absolute; z-index: 16/);
  assert.doesNotMatch(source, /orientation-note/);
  assert.doesNotMatch(source, /chibi-meeting/);
  assert.doesNotMatch(source, /if \(open !== null\) return/);
});
