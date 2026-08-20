"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  {
    number: "01",
    short: "關於我們",
    eyebrow: "ABOUT US",
    title: "關於我們\nABOUT US",
    subtitle: "兩個不同步調的人，慢慢走成同一個方向。",
    detailTitle: "This is our story",
    detailCopy: "從相遇到相伴，平凡的日子因為彼此而有了新的名字。",
  },
  {
    number: "02",
    short: "故事",
    eyebrow: "OUR STORY",
    title: "所有恰好的相遇，\n都慢慢走成了我們",
    subtitle: "從一杯咖啡，到同一個未來",
    detailTitle: "The day we met",
    detailCopy:
      "從第一次說你好，到決定一起走很遠。那些看似平凡的日常，讓我們確定：最好的愛情，是每一天都仍然想和對方分享。",
  },
  {
    number: "03",
    short: "婚宴",
    eyebrow: "THE WEDDING DAY",
    title: "一場關於愛與相聚的\n午後慶典",
    subtitle: "2027. 05. 22 · 台北",
    detailTitle: "Save the date",
    detailCopy:
      "二〇二七年五月二十二日，星期六。下午三時迎賓，四時證婚，五時三十分晚宴。地點與交通資訊將於正式版本補上。",
  },
  {
    number: "04",
    short: "回覆",
    eyebrow: "BE OUR GUEST",
    title: "把你的名字，\n寫進這一天的回憶裡",
    subtitle: "期待在婚禮那天與你相見",
    detailTitle: "Will you join us?",
    detailCopy:
      "這裡會放置出席回覆、飲食需求與同行人數等欄位。正式版本也可以串接你之前的婚禮詢問表單。",
  },
] as const;

const aboutStory = [
  { zh: "我們的故事，沒有轟轟烈烈的開場。", en: "Our story did not begin with a grand gesture." },
  { zh: "只是在一次次分享與陪伴裡，慢慢確認了彼此。", en: "It grew quietly through every conversation, every shared moment, and every day we chose to stay." },
  { zh: "他讓平凡的日子有了期待；她讓未來變得清晰而溫柔。", en: "He gave ordinary days something to look forward to; she made the future feel clear and gentle." },
  { zh: "我們保留各自的模樣，也成為彼此最安心的地方。", en: "We remained ourselves, while becoming each other’s safest place." },
  { zh: "從今天起，想把往後的每一段風景，一起看完。", en: "From this day forward, we choose to see every season, side by side." },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Home() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState<number | null>(null);
  const [pull, setPull] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [portraitDismissed, setPortraitDismissed] = useState(false);
  const dragStart = useRef(0);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const startPull = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    if (open !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    handleRef.current = event.currentTarget;
    dragStart.current = event.clientX;
    setDragging(index);
    setPull(0);
  };

  const movePull = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragging === null) return;
    const maxPull = Math.max(window.innerWidth * 0.34, 230);
    const next = clamp((event.clientX - dragStart.current) / maxPull, 0, 1);
    setPull(next);
    if (next > 0.08 && active !== dragging) setActive(dragging);
  };

  const finishPull = () => {
    if (dragging === null) return;
    const selected = dragging;
    if (pull >= 0.68) {
      setActive(selected);
      setOpen(selected);
    } else if (pull > 0.04) {
      setActive(selected);
    }
    setDragging(null);
    setPull(0);
  };

  const activateWithKeyboard = (index: number) => {
    if (active === index) setOpen(index);
    else setActive(index);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (open !== null) return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        setActive((value) => (value + 1) % chapters.length);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        setActive((value) => (value - 1 + chapters.length) % chapters.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <main className="invitation-shell" style={{ "--about-photo": 'url("about-us.jpg")' } as React.CSSProperties}>
      <div className="paper-grain" aria-hidden="true" />
      <header className="masthead">
        <div className="monogram" aria-label="新人姓名縮寫">Y <i>&amp;</i> C</div>
        <p>Yu-Wei &amp; Chia-Ning</p>
      </header>

      <nav className="pull-nav" aria-label="喜帖章節">
        {chapters.map((chapter, index) => {
          const isDragging = dragging === index;
          const isActive = active === index;
          const offset = isDragging ? pull * Math.min(420, windowSafeWidth() * 0.34) : 0;
          return (
            <button
              ref={isDragging ? handleRef : null}
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
                  activateWithKeyboard(index);
                }
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${chapter.short}。輕拉切換，拉到底展開內容`}
            >
              <span className="handle-number">{chapter.number}</span>
              <span className="handle-label">{chapter.short}</span>
              <span className="handle-line" aria-hidden="true">
                <span className="handle-progress" />
              </span>
              <span className="handle-arrow" aria-hidden="true">→</span>
              <span className="handle-hint">輕拉預覽 · 拉滿展開</span>
            </button>
          );
        })}
      </nav>

      <section className="stage" aria-live="polite">
        <div className="frame-corner frame-corner-one" aria-hidden="true" />
        <div className="frame-corner frame-corner-two" aria-hidden="true" />
        <div
          className="slides"
          style={{ transform: `translateY(-${active * 100}%)` }}
        >
          {chapters.map((chapter, index) => (
            <article className={`slide slide-${index + 1}`} key={chapter.number}>
              {index === 0 ? (
                <>
                  <div className="about-preview-photo" aria-label="新人照片預留區" />
                  <div className="about-preview-vignette" aria-hidden="true" />
                  <div className="about-preview-copy">
                    <p className="about-kicker"><span>第一章</span><small>CHAPTER ONE</small></p>
                    <h1><span>關於我們</span><small>ABOUT US</small></h1>
                    <div className="about-rule" aria-hidden="true" />
                    <p className="about-intro">
                      <span>兩個不同步調的人，在相遇後，慢慢學會把日常走成同一個方向。</span>
                      <small>Two people with different rhythms, learning to walk toward the same tomorrow.</small>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="slide-copy">
                    <p className="eyebrow">{chapter.eyebrow}</p>
                    <h1>{chapter.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
                    <div className="flourish" aria-hidden="true"><i /><b>✦</b><i /></div>
                    <p className="subtitle">{chapter.subtitle}</p>
                  </div>
                  <div className="photo-composition" aria-label="照片預留區">
                    <div className="photo-card photo-back"><span>PHOTO</span></div>
                    <div className="photo-card photo-front">
                      <span className="photo-index">{chapter.number}</span>
                      <div className="photo-placeholder">照片／動畫<br />預留位置</div>
                      <small>YOUR MOMENT HERE</small>
                    </div>
                    <div className="botanical botanical-one" aria-hidden="true"><i /><i /><i /></div>
                    <div className="botanical botanical-two" aria-hidden="true"><i /><i /><i /></div>
                  </div>
                  <span className="giant-number" aria-hidden="true">{chapter.number}</span>
                </>
              )}
            </article>
          ))}
        </div>
        <div className="stage-footer">
          <p><span>DRAG</span> 將左側緞帶向右拉動</p>
          <div className="pagination"><b>{String(active + 1).padStart(2, "0")}</b><i /><span>04</span></div>
        </div>
      </section>

      {open !== null && (
        <section
          className={`detail detail-${open + 1} ${open === 0 ? "about-detail" : ""}`}
          style={{
            "--detail-top": `${7 + open * 22}%`,
            "--detail-bottom": `${71 - open * 22}%`,
          } as React.CSSProperties}
          aria-modal="true"
          role="dialog"
          aria-labelledby="detail-title"
        >
          {open === 0 ? (
            <>
              <div className="about-photo about-photo-muted" aria-hidden="true" />
              <div className="about-photo about-photo-reveal" aria-hidden="true" />
              <div className="about-detail-shade" aria-hidden="true" />
              <div className="about-detail-content">
                <header className="about-detail-heading">
                  <p><span>關於我們</span><small>ABOUT US</small></p>
                  <h2 id="detail-title"><span>兩個人的故事，</span><span>從此有了同一個方向。</span></h2>
                </header>
                <div className="about-story" aria-label="新人介紹">
                  {aboutStory.map((line, index) => (
                    <p className="story-line" style={{ "--line-index": index } as React.CSSProperties} key={line.zh}>
                      <span>{line.zh}</span>
                      <small>{line.en}</small>
                    </p>
                  ))}
                </div>
              </div>
              <div className="chibi-meeting" aria-label="Q版新人相遇動畫">
                <div className="chibi chibi-left"><i className="chibi-head" /><i className="chibi-body" /><b>Y</b></div>
                <span className="meeting-heart" aria-hidden="true">♥</span>
                <div className="chibi chibi-right"><i className="chibi-head" /><i className="chibi-body" /><b>C</b></div>
              </div>
              <p className="about-close-note"><span>按 ESC 關閉</span><small>PRESS ESC TO CLOSE</small></p>
              <button className="detail-close" onClick={() => setOpen(null)} aria-label="關閉關於我們">×</button>
            </>
          ) : (
            <>
              <button className="detail-close" onClick={() => setOpen(null)} aria-label="關閉展開內容">×</button>
              <div className="detail-index">{chapters[open].number}</div>
              <div className="detail-visual">
                <span>FULL STORY</span>
                <div className="detail-photo">完整照片／影片／動畫區域</div>
              </div>
              <div className="detail-copy">
                <p className="eyebrow">{chapters[open].eyebrow}</p>
                <h2 id="detail-title">{chapters[open].detailTitle}</h2>
                <p>{chapters[open].detailCopy}</p>
                {open === 3 && <button className="rsvp-demo">開啟出席回覆 <span>→</span></button>}
                <small>按 ESC 或右上角關閉，繼續翻閱喜帖</small>
              </div>
            </>
          )}
        </section>
      )}

      <aside className="orientation-note" aria-hidden={portraitDismissed} data-dismissed={portraitDismissed}>
        <div className="rotate-icon" aria-hidden="true"><span>↻</span></div>
        <p className="eyebrow">BEST VIEWING EXPERIENCE</p>
        <h2>請將裝置轉為橫向</h2>
        <p>這封喜帖以橫式互動設計，轉向後可以看見完整畫面與拉條效果。</p>
        <button onClick={() => setPortraitDismissed(true)}>仍要直向瀏覽</button>
      </aside>
    </main>
  );
}

function windowSafeWidth() {
  return typeof window === "undefined" ? 1200 : window.innerWidth;
}
