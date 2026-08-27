"use client";

import { useEffect, useRef, useState } from "react";

const WEDDING_AT = new Date("2026-12-12T18:00:00+08:00").getTime();

const chapters = [
  { number: "01", short: "關於我們", eyebrow: "ABOUT US" },
  { number: "02", short: "兩家之喜", eyebrow: "TWO FAMILIES" },
  { number: "03", short: "婚宴地點", eyebrow: "THE VENUE" },
] as const;

const aboutStory = [
  { zh: "從一次不經意的相遇開始，", en: "It began with an unexpected encounter." },
  { zh: "我們在幾句問候裡慢慢熟悉彼此。", en: "A few simple greetings slowly brought us closer." },
  { zh: "原以為只是人海中的短暫交會，", en: "What seemed like a passing moment in a sea of people," },
  { zh: "後來才發現，那一次滑過，", en: "became the one gentle swipe that changed everything," },
  { zh: "竟悄悄把彼此帶進了往後的生活。", en: "quietly leading us into a lifetime together." },
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
  const [landscapeTipOpen, setLandscapeTipOpen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [visibleViewport, setVisibleViewport] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const scrollRoot = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLElement | null>>([]);
  const landscapeTipDismissed = useRef(false);

  useEffect(() => {
    setCountdown(remainingTime());
    const timer = window.setInterval(() => setCountdown(remainingTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncOrientationTip = () => {
      const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      if (!isLandscape) {
        landscapeTipDismissed.current = false;
        setLandscapeTipOpen(false);
        return;
      }
      if (isTouch && !landscapeTipDismissed.current) setLandscapeTipOpen(true);
    };
    syncOrientationTip();
    window.addEventListener("orientationchange", syncOrientationTip);
    return () => window.removeEventListener("orientationchange", syncOrientationTip);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    const syncViewport = () => {
      if (viewport && viewport.scale > 1.01) return;
      setVisibleViewport({
        left: viewport?.offsetLeft ?? 0,
        top: viewport?.offsetTop ?? 0,
        width: viewport?.width ?? window.innerWidth,
        height: viewport?.height ?? window.innerHeight,
      });
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);
    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
    };
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
        <div className="name-lockup">
          <p>冠禎 <i>&amp;</i> 玟慧</p>
          <small>OUR WEDDING DAY</small>
        </div>
      </header>

      <aside className="vertical-countdown" aria-label="距離婚宴開始倒數">
        <p>COUNTDOWN <span>TO WEDDING</span></p>
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
        <section className="story-page story-page-1" data-page="0" ref={(node) => { pageRefs.current[0] = node; }}><AboutPreview isActive={active === 0} /><DogRibbon label="拉開・關於我們" onOpen={() => setOpen(0)} /></section>
        <section className="story-page story-page-2" data-page="1" ref={(node) => { pageRefs.current[1] = node; }}><FamiliesPreview /><DogRibbon label="拉開・兩家之囍" onOpen={() => setOpen(1)} /></section>
        <section className="story-page story-page-3" data-page="2" ref={(node) => { pageRefs.current[2] = node; }}><VenuePreview onOpen={() => setOpen(2)} /></section>
      </div>

      {open !== null && (
        <section
          className={`detail-overlay detail-theme-${open + 1}`}
          style={{
            "--visible-left": `${visibleViewport.left}px`,
            "--visible-top": `${visibleViewport.top}px`,
            "--visible-width": `${visibleViewport.width}px`,
            "--visible-height": `${visibleViewport.height}px`,
          } as React.CSSProperties}
          role="dialog"
          aria-modal="true"
          aria-label={`${chapters[open].short}完整內容`}
        >
          <button className="detail-close" onClick={() => setOpen(null)} aria-label="關閉展開內容">×</button>
          <div className="detail-sheet">
            {open === 0 && <AboutDetail />}
            {open === 1 && <FamiliesDetail />}
            {open === 2 && <VenueDetail />}
          </div>
          {open === 2 && <div className="venue-opening" aria-hidden="true"><span /><i /><b /></div>}
        </section>
      )}

      {landscapeTipOpen && (
        <aside className="portrait-view-tip" role="dialog" aria-label="直向觀賞提醒">
          <div className="portrait-device" aria-hidden="true"><i /><span>↻</span></div>
          <p><small>BEST VIEWING EXPERIENCE</small><b>建議轉回直向觀賞</b><span>直向瀏覽能呈現最完整的照片、文字與展開內容。</span></p>
          <button onClick={() => { landscapeTipDismissed.current = true; setLandscapeTipOpen(false); }}>仍要橫向觀看</button>
        </aside>
      )}
    </main>
  );
}

function DogRibbon({ label, onOpen }: { label: string; onOpen: () => void }) {
  const [pull, setPull] = useState(0);
  const [autoOpening, setAutoOpening] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const skipClick = useRef(false);
  const openTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (openTimer.current !== null) window.clearTimeout(openTimer.current);
  }, []);

  const openAutomatically = () => {
    if (autoOpening) return;
    setAutoOpening(true);
    setPull(1);
    openTimer.current = window.setTimeout(() => {
      onOpen();
      setPull(0);
      setAutoOpening(false);
    }, 620);
  };

  const finish = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (pull >= 0.68) {
      skipClick.current = true;
      onOpen();
    }
    setPull(0);
  };

  return (
    <button
      className={`dog-ribbon-opener ${autoOpening ? "is-auto-opening" : ""}`}
      style={{
        "--dog-pull-x": `${pull * 120}px`,
        "--dog-progress": `${pull * 100}%`,
        "--ribbon-opacity": Math.min(pull * 4, 1),
        "--hint-opacity": pull < .05 ? 1 : 0,
      } as React.CSSProperties}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = true;
        skipClick.current = false;
        startX.current = event.clientX;
        setPull(0);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        if (Math.abs(event.clientX - startX.current) > 5) skipClick.current = true;
        setPull(clamp((event.clientX - startX.current) / 170, 0, 1));
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onClick={() => {
        if (skipClick.current) {
          skipClick.current = false;
          return;
        }
        openAutomatically();
      }}
      onDragStart={(event) => event.preventDefault()}
      aria-label={`${label}，向右拖拉或點擊雙犬即可展開`}
    >
      <span className="dog-illustration"><img src="dog-ribbon-guide.png" alt="黃金獵犬與長毛臘腸拉著緞帶" draggable={false} /></span>
      <span className="dog-arrow" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}

function AboutPreview({ isActive }: { isActive: boolean }) {
  return (
    <article className={`page-preview about-page-preview ${isActive ? "is-active" : ""}`}>
      <div className="about-portrait">
        <div className="about-photo-backdrop" aria-hidden="true" />
        <div className="about-photo-layer"><img src="about-us.jpg" alt="冠禎與玟慧在中式建築前的婚紗照" /></div>
      </div>
      <div className="about-preview-copy vertical-copy-card">
        <h1><span>關於我們</span><small>ABOUT US</small></h1>
        <div className="gold-rule" aria-hidden="true" />
        <div className="intro-lines">
          <p><span>兩個不同步調的人，</span><small>Two people with different rhythms,</small></p>
          <p><span>在相遇後慢慢靠近，</span><small>slowly drew closer after meeting,</small></p>
          <p><span>將日常走成同一個方向。</span><small>and began walking toward the same tomorrow.</small></p>
        </div>
      </div>
    </article>
  );
}

function FamiliesPreview() {
  return (
    <article className="page-preview families-page-preview">
      <div className="family-paper-card">
        <div className="family-copy-new">
          <div className="family-title-row">
            <h1><span>兩家之囍</span><small>TWO FAMILIES, ONE JOY</small></h1>
            <span className="xi-stamp" aria-hidden="true" />
          </div>
          <p className="bilingual-intro"><span>兩姓締盟，良緣永結<br />承兩家之愛，赴一世之約。</span><small>Two families become one, and our forever begins.</small></p>
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

function VenuePreview({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="page-preview venue-page-preview">
      <div className="venue-copy vertical-copy-card">
        <p className="venue-eyebrow">THE WEDDING VENUE</p>
        <h1><span>相聚・台南</span><small>MEET US IN TAINAN</small></h1>
        <div className="venue-hotel-row">
          <div>
            <p className="venue-name">台南晶英酒店<small>SILKS PLACE TAINAN</small></p>
            <p className="venue-address">700 台南市中西區和意路 1 號<br /><small>No. 1, Heyi Rd., West Central Dist., Tainan City</small></p>
          </div>
          <img className="venue-logo-mark" src="silks-place-logo.png" alt="台南晶英酒店 Silks Place Tainan" />
        </div>
      </div>
      <div className="venue-preview-visual">
        <figure className="venue-route-photo"><img src="silks-hotel-exterior.png" alt="夜色中的台南晶英酒店外觀" /></figure>
        <button type="button" className="venue-detail-trigger" onClick={onOpen}>點擊查看詳細交通資訊 <span>→</span></button>
      </div>
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
        <p><span>OUR STORY</span></p>
        <h2>從指尖的滑過　到餘生的相握</h2>
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const timer = window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.clientHeight, behavior: "smooth" });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="families-detail-inner" ref={scrollRef}>
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
        <p className="family-venue"><small>地點 · VENUE</small><b>台南晶英酒店・大成廳</b></p>
        <p className="respectfully-invite">黃府 · 李府　敬邀</p>
      </div>
    </div>
  );
}

function VenueDetail() {
  const transportOptions = [
    { id: "rail", label: "高鐵", title: "高鐵快捷公車", text: "高鐵至台南站後，由 2 號出口前往快捷公車站，搭乘「高鐵台南站－台南市政府」路線，於小西門站下車，再沿和意路步行約 50 公尺抵達。" },
    { id: "drive", label: "開車", title: "自行開車", text: "由中山高速公路下仁德交流道，往台南市區方向行駛，經中山路、東門路、府前路，左轉永福路後右轉和意路，即可抵達台南晶英酒店。" },
    { id: "bus", label: "公車", title: "市區公車", text: "可搭乘 1、2、5、11、18、紅2、綠17、藍24或紅幹線，於「新光三越新天地站」下車，步行約 3 分鐘即可抵達。" },
    { id: "parking", label: "停車", title: "飯店地下停車場", text: "飯店專屬停車場位於 B5－B7，可由永福路或和意路入口進入。館內用餐消費至多折抵 4 小時；離場前請至 B5－B7 梯廳繳費機輸入車牌確認折抵。" },
  ] as const;
  const [selectedTransport, setSelectedTransport] = useState<(typeof transportOptions)[number]["id"]>("rail");
  const selected = transportOptions.find((option) => option.id === selectedTransport) ?? transportOptions[0];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const timer = window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.clientHeight, behavior: "smooth" });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="venue-detail-inner" ref={scrollRef}>
      <section className="venue-map-panel">
        <div className="venue-map-crop"><img src="silks-traffic-guide.png" alt="台南晶英酒店周邊交通地圖" /></div>
        <div className="venue-contact-card">
          <p><span>地址</span><b>700 台南市中西區和意路 1 號</b><small>No. 1, Heyi Rd., West Central Dist., Tainan City 700</small></p>
          <p><span>聯絡電話</span><b>+886 6 213 6290</b></p>
          <a className="hotel-website" href="https://tainan.silksplace.com/tw/" target="_blank" rel="noreferrer">tainan.silksplace.com/tw/ ↗</a>
          <a className="map-link" href="https://www.google.com/maps/search/?api=1&query=%E5%8F%B0%E5%8D%97%E6%99%B6%E8%8B%B1%E9%85%92%E5%BA%97" target="_blank" rel="noreferrer">開啟 Google 地圖 <span>↗</span></a>
        </div>
      </section>
      <section className="transport-panel">
        <p className="transport-kicker">ARRIVAL GUIDE</p>
        <h2>前往晶英<small>選擇交通方式，查看對應路線資訊</small></h2>
        <div className="transport-tabs" role="tablist" aria-label="交通方式">
          {transportOptions.map((option) => (
            <button key={option.id} type="button" role="tab" aria-selected={selectedTransport === option.id} className={selectedTransport === option.id ? "is-active" : ""} onClick={() => setSelectedTransport(option.id)}>
              <i className={`transport-icon transport-icon-${option.id}`} aria-hidden="true">
                {option.id === "parking" ? <b className="parking-symbol">P</b> : <img src={option.id === "drive" ? "transport-drive-clean.png" : `transport-${option.id}.png`} alt="" />}
              </i><span>{option.label}</span>
            </button>
          ))}
        </div>
        <div className="transport-slide" key={selected.id} role="tabpanel">
          <small>{selected.label.toUpperCase()} INFORMATION</small>
          <h3>{selected.title}</h3>
          <p>{selected.text}</p>
        </div>
      </section>
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

function safeWidth() {
  return typeof window === "undefined" ? 1200 : window.innerWidth;
}
