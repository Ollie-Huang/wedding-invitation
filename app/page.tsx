"use client";

import { useEffect, useRef, useState } from "react";

const WEDDING_AT = new Date("2026-12-12T18:00:00+08:00").getTime();

const chapters = [
  { number: "01", short: "關於我們", eyebrow: "ABOUT US" },
  { number: "02", short: "兩家之喜", eyebrow: "TWO FAMILIES" },
  { number: "03", short: "婚宴地點", eyebrow: "THE VENUE" },
  { number: "04", short: "出席回覆", eyebrow: "BE OUR GUEST" },
] as const;

const aboutStory = [
  { zh: "我們的故事，沒有轟轟烈烈的開場。", en: "Our story did not begin with a grand gesture." },
  { zh: "只是在一次次分享與陪伴裡，慢慢確認了彼此。", en: "It grew quietly through every conversation and every shared moment." },
  { zh: "他讓平凡的日子有了期待；她讓未來變得清晰而溫柔。", en: "He gave ordinary days something to await; she made the future feel gentle and clear." },
  { zh: "我們保留各自的模樣，也成為彼此最安心的地方。", en: "We remained ourselves, while becoming each other’s safest place." },
  { zh: "從今天起，想把往後的每一段風景，一起看完。", en: "From this day forward, we choose to see every season, side by side." },
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function remainingTime() {
  const remaining = Math.max(0, WEDDING_AT - Date.now());
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };
}

export default function Home() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState<number | null>(null);
  const [pull, setPull] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [viewingTipOpen, setViewingTipOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenHelp, setFullscreenHelp] = useState(false);
  const [canvasFit, setCanvasFit] = useState({ fitted: false, scale: 1, left: 0, top: 0 });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const dragStart = useRef(0);

  useEffect(() => {
    setCountdown(remainingTime());
    const timer = window.setInterval(() => setCountdown(remainingTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    const syncCanvasScale = () => {
      const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      const isPortraitDevice = window.matchMedia("(orientation: portrait) and (max-width: 1024px)").matches;
      if (!isTouchDevice && !isPortraitDevice) {
        setCanvasFit({ fitted: false, scale: 1, left: 0, top: 0 });
        return;
      }

      const visibleWidth = viewport?.width ?? window.innerWidth;
      const visibleHeight = viewport?.height ?? window.innerHeight;
      const safeMargin = 12;
      setCanvasFit({
        fitted: true,
        scale: Math.max(0.1, Math.min((visibleWidth - safeMargin * 2) / 1600, (visibleHeight - safeMargin * 2) / 900)),
        left: (viewport?.offsetLeft ?? 0) + visibleWidth / 2,
        top: (viewport?.offsetTop ?? 0) + visibleHeight / 2,
      });
    };
    syncCanvasScale();
    window.addEventListener("resize", syncCanvasScale);
    window.addEventListener("orientationchange", syncCanvasScale);
    viewport?.addEventListener("resize", syncCanvasScale);
    viewport?.addEventListener("scroll", syncCanvasScale);
    return () => {
      window.removeEventListener("resize", syncCanvasScale);
      window.removeEventListener("orientationchange", syncCanvasScale);
      viewport?.removeEventListener("resize", syncCanvasScale);
      viewport?.removeEventListener("scroll", syncCanvasScale);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        setOpen(null);
        setActive((value) => (value + 1) % chapters.length);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        setOpen(null);
        setActive((value) => (value - 1 + chapters.length) % chapters.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const startPull = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = event.clientX;
    setDragging(index);
    setPull(0);
  };

  const movePull = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging === null) return;
    const maxPull = Math.max(window.innerWidth * 0.34, 210);
    const next = clamp((event.clientX - dragStart.current) / maxPull, 0, 1);
    setPull(next);
    if (next > 0.07 && active !== dragging) {
      setOpen(null);
      setActive(dragging);
    }
  };

  const finishPull = () => {
    if (dragging === null) return;
    const selected = dragging;
    if (pull >= 0.68) {
      setActive(selected);
      setOpen(selected);
    } else if (pull > 0.04) {
      setOpen(null);
      setActive(selected);
    }
    setDragging(null);
    setPull(0);
  };

  const toggleFullscreen = async () => {
    setFullscreenHelp(false);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        setFullscreenHelp(true);
      }
    } catch {
      setFullscreenHelp(true);
    }
  };

  return (
    <main className={`invitation-shell theme-${active + 1}`}>
      <div className="paper-grain" aria-hidden="true" />

      <div
        className="invitation-canvas"
        data-fitted={canvasFit.fitted}
        style={{
          "--canvas-scale": canvasFit.scale,
          "--canvas-left": `${canvasFit.left}px`,
          "--canvas-top": `${canvasFit.top}px`,
        } as React.CSSProperties}
      >

      <header className="masthead" aria-label="新人姓名">
        <span className="name-ornament" aria-hidden="true">✦</span>
        <div className="name-lockup">
          <p>冠禎 <i>&amp;</i> 玟慧</p>
          <small>OUR WEDDING DAY</small>
        </div>
      </header>

      <aside className="countdown" aria-label="距離婚宴開始倒數">
        <p>COUNTDOWN <span>TO 18:00</span></p>
        <div>
          <b>{countdown.days}</b><small>DAYS</small><i>:</i>
          <b>{String(countdown.hours).padStart(2, "0")}</b><small>HRS</small><i>:</i>
          <b>{String(countdown.minutes).padStart(2, "0")}</b><small>MIN</small><i>:</i>
          <b>{String(countdown.seconds).padStart(2, "0")}</b><small>SEC</small>
        </div>
      </aside>

      <nav className="pull-nav" aria-label="喜帖章節">
        {chapters.map((chapter, index) => {
          const isDragging = dragging === index;
          const isActive = active === index;
          const offset = isDragging ? pull * Math.min(420, safeWidth() * 0.34) : 0;
          return (
            <button
              key={chapter.number}
              className={`pull-handle ${isActive ? "is-active" : ""} ${isDragging ? "is-dragging" : ""}`}
              style={{ "--pull-x": `${offset}px` } as React.CSSProperties}
              onPointerDown={(event) => startPull(event, index)}
              onPointerMove={movePull}
              onPointerUp={finishPull}
              onPointerCancel={finishPull}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (active === index && open === null) setOpen(index);
                  else {
                    setOpen(null);
                    setActive(index);
                  }
                }
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${chapter.short}。輕拉切換，拉到底展開內容`}
            >
              <span className="handle-number">{chapter.number}</span>
              <span className="handle-label">{chapter.short}</span>
              <span className="handle-arrow" aria-hidden="true">→</span>
            </button>
          );
        })}
      </nav>

      <section className="stage" aria-live="polite">
        <div className="frame-corner frame-corner-one" aria-hidden="true" />
        <div className="frame-corner frame-corner-two" aria-hidden="true" />
        <div className="slides" style={{ transform: `translateY(-${active * 100}%)` }}>
          <AboutPreview />
          <FamiliesPreview />
          <VenuePreview />
          <RsvpPreview />
        </div>

        <footer className="stage-footer">
          <p><span>DRAG</span> 將左側緞帶向右拉動</p>
          <div className="pagination"><b>{String(active + 1).padStart(2, "0")}</b><i /><span>04</span></div>
        </footer>

        {open !== null && (
          <>
            <span className="detail-cord" style={{ "--cord-row": open } as React.CSSProperties} aria-hidden="true" />
            <section className={`detail-panel detail-${open + 1}`} role="dialog" aria-label={`${chapters[open].short}完整內容`}>
              <button className="detail-close" onClick={() => setOpen(null)} aria-label="關閉展開內容">×</button>
              {open === 0 && <AboutDetail />}
              {open === 1 && <FamiliesDetail />}
              {open === 2 && <VenueDetail />}
              {open === 3 && <RsvpDetail />}
            </section>
          </>
        )}
      </section>
      </div>

      <aside className="viewing-tip" data-dismissed={!viewingTipOpen} aria-hidden={!viewingTipOpen}>
        <div className="viewing-tip-card">
          <div className="rotate-device" aria-hidden="true"><i /><span>↻</span></div>
          <p className="chapter-kicker"><span>最佳觀賞方式</span><small>BEST VIEWING EXPERIENCE</small></p>
          <h2>建議將手機轉為橫向</h2>
          <p>橫向觀看能完整呈現照片、拉條與展開動畫；你仍然可以選擇直向瀏覽。</p>
          <div className="viewing-tip-actions">
            <button onClick={async () => { await toggleFullscreen(); setViewingTipOpen(false); }}>橫向・全螢幕觀看</button>
            <button className="tip-secondary" onClick={() => setViewingTipOpen(false)}>繼續直向瀏覽</button>
          </div>
          <small>iPhone／iPad 若仍顯示網址列，可從分享選單選擇「加入主畫面」，再由主畫面開啟。</small>
        </div>
      </aside>

      <button className="mobile-fullscreen-toggle" onClick={toggleFullscreen} aria-label={isFullscreen ? "離開全螢幕" : "進入全螢幕"}>
        <span aria-hidden="true">{isFullscreen ? "↙" : "⛶"}</span>{isFullscreen ? "離開全螢幕" : "全螢幕觀看"}
      </button>
      {fullscreenHelp && <p className="fullscreen-help" role="status">此瀏覽器不支援網頁全螢幕，請從分享選單選擇「加入主畫面」。</p>}
    </main>
  );
}

function AboutPreview() {
  return (
    <article className="slide slide-1">
      <div className="about-preview-copy">
        <p className="chapter-kicker"><span>第一章</span><small>CHAPTER ONE</small></p>
        <h1><span>關於我們</span><small>ABOUT US</small></h1>
        <div className="gold-rule" aria-hidden="true" />
        <p className="bilingual-intro"><span>兩個不同步調的人，在相遇後，慢慢學會把日常走成同一個方向。</span><small>Two people with different rhythms, learning to walk toward the same tomorrow.</small></p>
      </div>
      <div className="legacy-photo-composition" aria-label="冠禎與玟慧的婚紗照">
        <div className="legacy-photo-back" aria-hidden="true" />
        <div className="legacy-photo-front"><img src="about-us.jpg" alt="冠禎與玟慧的婚紗照" /></div>
        <div className="legacy-botanical legacy-botanical-one" aria-hidden="true"><i /><i /><i /></div>
        <div className="legacy-botanical legacy-botanical-two" aria-hidden="true"><i /><i /><i /></div>
      </div>
    </article>
  );
}

function FamiliesPreview() {
  return (
    <article className="slide slide-2">
      <div className="families-copy">
        <p className="chapter-kicker"><span>第二章</span><small>CHAPTER TWO</small></p>
        <div className="families-heading">
          <span className="double-happiness" aria-hidden="true">囍</span>
          <h1><span>兩家之囍</span><small>TWO FAMILIES, ONE JOY</small></h1>
        </div>
        <p className="bilingual-intro"><span>承兩家之愛，結一世之好。</span><small>With the love of two families, we begin our forever.</small></p>
        <div className="umbrella-couple">
          <img src="chibi-umbrella.png" alt="紅傘下的新郎冠禎與新娘玟慧 Q 版插畫" />
          <div className="couple-name couple-name-groom"><small>新郎</small><b>黃冠禎</b></div>
          <div className="couple-name couple-name-bride"><small>新娘</small><b>李玟慧</b></div>
        </div>
      </div>
      <figure className="family-cover-photo"><img src="families-cover.jpg" alt="冠禎、玟慧與兩隻狗狗的婚紗照" /><figcaption>OUR FAMILY PORTRAIT · 2026</figcaption></figure>
    </article>
  );
}

function VenuePreview() {
  return (
    <article className="slide slide-3">
      <div className="venue-copy">
        <p className="chapter-kicker"><span>第三章</span><small>CHAPTER THREE</small></p>
        <h1><span>相聚・台南</span><small>THE WEDDING VENUE</small></h1>
        <p className="venue-name">台南晶英酒店<small>SILKS PLACE TAINAN</small></p>
        <p className="venue-address">700 台南市中西區和意路 1 號<br /><small>No. 1, Heyi Rd., West Central Dist., Tainan City</small></p>
        <p className="venue-time">2026. 12. 12　18:00</p>
      </div>
      <MapCard compact />
    </article>
  );
}

function RsvpPreview() {
  return (
    <article className="slide slide-4 generic-slide">
      <div className="generic-copy">
        <p className="chapter-kicker"><span>第四章</span><small>CHAPTER FOUR</small></p>
        <h1><span>把你的名字，</span><span>寫進這一天的回憶裡</span><small>BE OUR GUEST</small></h1>
        <div className="gold-rule" />
        <p className="bilingual-intro"><span>期待在婚禮那天與你相見。</span><small>We cannot wait to celebrate this day with you.</small></p>
      </div>
      <div className="rsvp-seal" aria-hidden="true"><b>囍</b><small>RSVP</small></div>
    </article>
  );
}

function AboutDetail() {
  return (
    <div className="about-detail-inner">
      <div className="about-bands" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((index) => <img key={index} className={`about-band about-band-${index}`} src="about-detail.jpg" alt="" />)}
      </div>
      <div className="about-row about-heading-row">
        <p><span>關於我們</span><small>ABOUT US</small></p>
        <h2>兩個人的故事，從此有了同一個方向。</h2>
      </div>
      {aboutStory.map((line, index) => (
        <p className={`about-row story-row story-row-${index + 1}`} style={{ "--row-index": index + 1 } as React.CSSProperties} key={line.zh}>
          <span>{line.zh}</span><small>{line.en}</small>
        </p>
      ))}
    </div>
  );
}

function FamiliesDetail() {
  return (
    <div className="families-detail-inner">
      <figure className="family-detail-photo">
        <img src="families-detail.jpg" alt="冠禎與玟慧手持氣球的婚紗照" />
        <figcaption>THE BEGINNING OF OUR FOREVER</figcaption>
      </figure>
      <div className="family-invitation">
        <div className="xi-seal" aria-hidden="true"><span>囍</span></div>
        <p className="family-invite-kicker">兩姓締盟 · 良緣永結</p>
        <h2>敬邀您蒞臨我們的婚宴</h2>
        <p className="family-invite-copy">承蒙親友一路相伴，我們懷著喜悅與感恩，誠摯邀請您一同見證兩家相聚、兩心相許的重要時刻。</p>
        <div className="newlywed-names">
          <p><small>新郎 · GROOM</small><b>黃冠禎</b></p>
          <i>&amp;</i>
          <p><small>新娘 · BRIDE</small><b>李玟慧</b></p>
        </div>
        <dl className="family-hosts">
          <div><dt>男方主婚人</dt><dd>黃春安、謝秀鳳</dd></div>
          <div><dt>女方主婚人</dt><dd>李文獎、黃意芬</dd></div>
        </dl>
        <div className="wedding-facts">
          <p><small>日期 DATE</small><b>2026.12.12</b></p>
          <p><small>迎賓 WELCOME</small><b>17:30</b></p>
          <p><small>開席 BANQUET</small><b>18:00</b></p>
        </div>
        <p className="family-venue"><small>地點 · VENUE</small><b>台南晶英酒店 — 大成廳</b></p>
        <p className="respectfully-invite">黃府 · 李府　敬邀</p>
      </div>
    </div>
  );
}

function VenueDetail() {
  return (
    <div className="venue-detail-inner">
      <MapCard />
      <div className="venue-detail-copy">
        <p className="chapter-kicker"><span>婚宴地點</span><small>THE VENUE</small></p>
        <h2>台南晶英酒店<small>SILKS PLACE TAINAN</small></h2>
        <dl>
          <div><dt>日期與時間</dt><dd>2026 年 12 月 12 日・18:00</dd></div>
          <div><dt>地址</dt><dd>700 台南市中西區和意路 1 號</dd></div>
          <div><dt>開車前往</dt><dd>可由永福路或西門路進入和意路；停車資訊將於確認後補上。</dd></div>
          <div><dt>大眾交通</dt><dd>從台南車站搭乘計程車約 10 分鐘；實際時間依當日路況為準。</dd></div>
        </dl>
        <a className="map-link" href="https://www.google.com/maps/search/?api=1&query=%E5%8F%B0%E5%8D%97%E6%99%B6%E8%8B%B1%E9%85%92%E5%BA%97" target="_blank" rel="noreferrer">開啟 Google 地圖 <span>↗</span></a>
      </div>
    </div>
  );
}

function MapCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`map-card ${compact ? "is-compact" : ""}`}>
      <iframe title="台南晶英酒店 Google 地圖預覽" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=%E5%8F%B0%E5%8D%97%E6%99%B6%E8%8B%B1%E9%85%92%E5%BA%97&output=embed" />
      <div className="map-caption"><span>台南晶英酒店</span><small>SILKS PLACE TAINAN</small></div>
    </div>
  );
}

function RsvpDetail() {
  return (
    <div className="rsvp-detail-inner">
      <p className="chapter-kicker"><span>出席回覆</span><small>BE OUR GUEST</small></p>
      <h2>期待與你相見</h2>
      <p>這裡將串接正式的出席回覆表單，收集出席人數、飲食需求與同行賓客資訊。</p>
      <button type="button">出席表單・即將開放 <span>→</span></button>
    </div>
  );
}

function safeWidth() {
  return typeof window === "undefined" ? 1200 : window.innerWidth;
}
