import assert from "node:assert/strict";
import test from "node:test";

test("v0.7.1 invitation refines transparent ribbon and mobile detail layouts", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /scroll-pages/);
  assert.match(source, /story-page story-page-1/);
  assert.match(source, /story-page story-page-4/);
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /scrollIntoView/);
  assert.match(source, /DogRibbon/);
  assert.match(source, /dog-ribbon-guide\.png/);
  assert.match(source, /黃金獵犬與長毛臘腸/);
  assert.match(source, /families-cover\.jpg/);
  assert.match(source, /families-detail\.jpg/);
  assert.match(source, /2026-12-12T18:00:00\+08:00/);
  assert.match(source, /黃春安、謝秀鳳/);
  assert.match(source, /李文獎、黃意芬/);
  assert.match(source, /台南晶英酒店/);
  assert.match(source, /從指尖的滑過　到餘生的相握/);
  assert.match(source, /從一次不經意的相遇開始/);
  assert.match(source, /visualViewport/);
  assert.doesNotMatch(source, />第一章</);
  assert.doesNotMatch(source, />第二章</);
  assert.doesNotMatch(source, /PULL THE RIBBON TO OPEN/);
  assert.doesNotMatch(source, /pull-nav/);
  assert.doesNotMatch(source, /pull-handle/);
  assert.doesNotMatch(source, /invitation-canvas/);
  assert.doesNotMatch(source, /requestFullscreen/);

  assert.match(styles, /scroll-snap-type: y mandatory/);
  assert.match(styles, /scroll-snap-align: start/);
  assert.match(styles, /family-paper-card/);
  assert.match(styles, /dog-ribbon-opener/);
  assert.match(styles, /dog-ribbon-opener::before/);
  assert.match(styles, /scaleX\(-1\)/);
  assert.match(styles, /scroll-snap-type: y mandatory/);
  assert.match(styles, /@media \(max-width: 760px\)/);
});
