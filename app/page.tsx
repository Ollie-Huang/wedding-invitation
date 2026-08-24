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
  const [open, setOpen] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const scrollRoot = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    setCountdown(remainingTime());
    const timer = window.setInterval(() => setCountdown(remainingTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.page ?? 0));
      },
      { root: scrollRoot.current, threshold: [0.45, 0.6, 0.75] },
    );
    pageRefs.current.forEach((page) => page && observer.observe(page));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (open !== null) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") goToPage(Math.min(active + 1, chapters.length - 1));
      if (event.key === "ArrowUp" || event.key === "PageUp") goToPage(Math.max(active - 1, 0));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, open]);

  const goToPage = (index: number) => {
    pageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className={`vertical-invitation active-page-${active + 1}`}>
      <header className="vertical-masthead" aria-label="新人姓名">
        <span className="name-ornament" aria-hidden="true">✦</span>
        <div className="name-lockup">
          <p>冠禎 <i>&amp;</i> 玟慧</p>
          <small>OUR WEDDING DAY</small>
        </div>
      </header>

      <aside className="vertical-countdown" aria-label="距離婚宴開始倒數">
        <p>COUNTDOWN <span>TO 18:00</span></p>
        <div>
          <b>{countdown.days}</b><small>DAYS</small><i>:</i>
          <b>{String(countdown.hours).padStart(2, "0")}</b><small>HRS</small><i>:</i>
          <b>{String(countdown.minutes).padStart(2, "0")}</b><small>MIN</small><i>:</i>
          <b>{String(countdown.seconds).padStart(2, "0")}</b><small>SEC</small>
        </div>
      </aside>

      <nav className="page-dots" aria-label="喜帖章節導覽">
        {chapters.map((chapter, index) => (
          <button key={chapter.number} className={active === index ? "is-active" : ""} onClick={() => goToPage(index)} aria-label={`前往${chapter.short}`} aria-current={active === index ? "page" : undefined}>
            <span>{chapter.number}</span><i />
          </button>
        ))}
      </nav>

      <div className="scroll-pages" ref={scrollRoot}>
        <section className="story-page story-page-1" data-page="0" ref={(node) => { pageRefs.current[0] = node; }}><AboutPreview /><DogRibbon label="拉開・關於我們" onOpen={() => setOpen(0)} /></section>
        <section className="story-page story-page-2" data-page="1" ref={(node) => { pageRefs.current[1] = node; }}><FamiliesPreview /><DogRibbon label="拉開・兩家之囍" onOpen={() => setOpen(1)} /></section>
        <section className="story-page story-page-3" data-page="2" ref={(node) => { pageRefs.current[2] = node; }}><VenuePreview /><DogRibbon label="拉開・婚宴地點" onOpen={() => setOpen(2)} /></section>
        <section className="story-page story-page-4" data-page="3" ref={(node) => { pageRefs.current[3] = node; }}><RsvpPreview /><DogRibbon label="拉開・出席回覆" onOpen={() => setOpen(3)} /></section>
      </div>

      {open !== null && (
        <section className={`detail-overlay detail-theme-${open + 1}`} role="dialog" aria-modal="true" aria-label={`${chapters[open].short}完整內容`}>
          <button className="detail-close" onClick={() => setOpen(null)} aria-label="關閉展開內容">×</button>
          <div className="detail-sheet">
            {open === 0 && <AboutDetail />}
            {open === 1 && <FamiliesDetail />}
            {open === 2 && <VenueDetail />}
            {open === 3 && <RsvpDetail />}
          </div>
        </section>
      )}
    </main>
  );
}

function DogRibbon({ label, onOpen }: { label: string; onOpen: () => void }) {
  const [pull, setPull] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  const finish = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (pull >= 0.68) onOpen();
    setPull(0);
  };

  return (
    <button
      className="dog-ribbon-opener"
      style={{ "--dog-pull-x": `${pull * 120}px`, "--dog-progress": `${pull * 100}%` } as React.CSSProperties}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = true;
        startX.current = event.clientX;
        setPull(0);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        setPull(clamp((event.clientX - startX.current) / 170, 0, 1));
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`${label}，將狗狗與緞帶向右拉到底`}
    >
      <span className="dog-illustration"><img src="dog-ribbon-guide.gif" alt="黃金獵犬與長毛臘腸拉著緞帶" /></span>
      <span className="dog-guide-copy"><b>{label}</b><small>PULL THE RIBBON TO OPEN</small></span>
      <i className="dog-pull-track" aria-hidden="true"><span /></i>
    </button>
  );
}

function AboutPreview() {
  return (
    <article className="page-preview about-page-preview">
      <div className="about-portrait">
        <div className="about-photo-layer"><img src="about-us.jpg" alt="冠禎與玟慧在中式建築前的婚紗照" /></div>
      </div>
      <div className="about-preview-copy vertical-copy-card">
        <p className="chapter-kicker"><span>第一章</span><small>CHAPTER ONE</small></p>
        <h1><span>關於我們</span><small>ABOUT US</small></h1>
        <div className="gold-rule" aria-hidden="true" />
        <p className="bilingual-intro"><span>兩個不同步調的人，在相遇後，慢慢學會把日常走成同一個方向。</span><small>Two people with different rhythms, learning to walk toward the same tomorrow.</small></p>
      </div>
    </article>
  );
}

function FamiliesPreview() {
  return (
    <article className="page-preview families-page-preview">
      <div className="family-paper-card">
        <div className="family-copy-new">
          <p className="chapter-kicker"><span>第二章</span><small>CHAPTER TWO</small></p>
          <span className="xi-stamp" aria-hidden="true">囍</span>
          <h1><span>兩家之囍</span><small>TWO FAMILIES, ONE JOY</small></h1>
          <p className="bilingual-intro"><span>兩姓締盟，良緣永結；承兩家之愛，赴一世之約。</span><small>Two families become one, and our forever begins.</small></p>
          <div className="families-date"><span>2026</span><b>12 · 12</b><small>TAINAN · SILKS PLACE</small></div>
        </div>
        <figure className="family-gradient-photo">
          <img src="families-cover.jpg" alt="冠禎、玟慧與兩隻狗狗的婚紗照" />
          <figcaption>WITH OUR BELOVED FAMILY</figcaption>
        </figure>
      </div>
    </article>
  );
}

function VenuePreview() {
  return (
    <article className="page-preview venue-page-preview">
      <div className="venue-copy vertical-copy-card">
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
    <article className="page-preview rsvp-page-preview">
      <div className="generic-copy vertical-copy-card">
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
        <p className="family-invite-copy">承蒙親友一路相伴，我們懷著喜悅與感恩，<br />誠摯邀請您一同見證兩家相聚、兩心相許的重要時刻。</p>
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
