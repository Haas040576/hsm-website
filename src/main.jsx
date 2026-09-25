import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const services = [
  {
    id: "software",
    label: "Custom Softwares",
    kicker: "Individuelle Systeme",
    title: "Software, die sich an dein Unternehmen anpasst.",
    text: "Interne Tools, Dashboards und branchenspezifische Anwendungen – entwickelt um Abläufe sauber abzubilden statt neue Umwege zu schaffen.",
    bullets: ["Interne Unternehmenssoftware", "Dashboards & Portale", "Automatisierte Abläufe", "Branchenlösungen"],
    accent: "mint",
    icon: "code",
  },
  {
    id: "social",
    label: "Social Media Betreuung",
    kicker: "Content & Wachstum",
    title: "Social Media mit System statt Einzelposts.",
    text: "Strategie, Produktion, Planung und Auswertung werden zu einem durchgängigen Prozess – passend zur Marke und zur Zielgruppe.",
    bullets: ["Content Strategie", "Content Produktion", "Kampagnenplanung", "Performance Auswertung"],
    accent: "coral",
    icon: "camera",
  },
  {
    id: "ki",
    label: "KI Beratung",
    kicker: "Prozesse neu denken",
    title: "KI dort einsetzen, wo sie wirklich Zeit spart.",
    text: "Wir analysieren wiederkehrende Aufgaben, wählen sinnvolle Tools und bauen daraus nachvollziehbare Workflows für den Alltag.",
    bullets: ["Prozessanalyse", "Tool-Auswahl", "KI-Workflows", "Einführung & Schulung"],
    accent: "violet",
    icon: "spark",
  },
  {
    id: "websites",
    label: "Websites",
    kicker: "Design & Conversion",
    title: "Websites, die hochwertig aussehen und klar funktionieren.",
    text: "Individuelles Design, schnelle Umsetzung und saubere Nutzerführung – vom ersten Eindruck bis zur Anfrage.",
    bullets: ["Individuelles Webdesign", "Responsive Entwicklung", "SEO Grundlagen", "Wartung & Weiterentwicklung"],
    accent: "blue",
    icon: "screen",
  },
];

const projects = [
  {
    id: "charlies",
    title: "Das Charlie’s",
    category: "Restaurant Software",
    text: "Warenwirtschaft, Bestellvorschläge, Lieferantenübersicht und KI-gestützte Bedarfsprognosen in einem System.",
    detail: "Verkauf → Verbrauch → Bestand → Prognose → Bestellvorschlag → Freigabe.",
    kind: "dashboard",
  },
  {
    id: "yellow",
    title: "Fahrschulsoftware",
    category: "Custom Software",
    text: "Digitale Verwaltung für Fahrschulen mit Schülern, Fahrstunden, Terminen und internen Abläufen.",
    detail: "Ein zentrales System statt verteilten Listen und Einzeltools.",
    kind: "school",
  },
  {
    id: "gastro",
    title: "Gastro Tap",
    category: "NFC System",
    text: "Digitale Touchpoints für Restaurants – vom Menü über Bewertungen bis zum Kellnerruf.",
    detail: "NFC als physische Schnittstelle zu digitalen Services.",
    kind: "nfc",
  },
  {
    id: "campaigns",
    title: "HSM Campaigns",
    category: "Creator Platform",
    text: "Kampagnen- und Creator-Management für strukturierte Influencer-Kooperationen.",
    detail: "Kampagnen, Bewerbungen, Budgets und Creator-Status an einem Ort.",
    kind: "campaign",
  },
];

const checkQuestions = [
  {
    key: "type",
    title: "Was beschreibt dein Unternehmen am besten?",
    options: [
      { value: "gastro", label: "Restaurant / Café / Bar", icon: "⌁" },
      { value: "local", label: "Lokales Unternehmen", icon: "▣" },
      { value: "service", label: "Dienstleistung", icon: "◎" },
      { value: "retail", label: "Einzelhandel", icon: "▤" },
      { value: "driving", label: "Fahrschule", icon: "◇" },
      { value: "other", label: "Sonstiges", icon: "•••" },
    ],
  },
  {
    key: "manual",
    title: "Wie viele wiederkehrende Abläufe laufen bei euch noch manuell?",
    options: [
      { value: "many", label: "Viele", icon: "↻", sub: "Listen, Mails, Übertragungen" },
      { value: "some", label: "Einige", icon: "◐", sub: "Teilweise digitalisiert" },
      { value: "few", label: "Wenige", icon: "✓", sub: "Schon gut strukturiert" },
    ],
  },
  {
    key: "ai",
    title: "Wie nutzt ihr KI aktuell im Unternehmen?",
    options: [
      { value: "none", label: "Noch gar nicht", icon: "○" },
      { value: "tools", label: "Einzelne Tools", icon: "✦" },
      { value: "workflows", label: "Feste Workflows", icon: "⟲" },
    ],
  },
  {
    key: "web",
    title: "Wie zufrieden bist du mit eurem digitalen Auftritt?",
    options: [
      { value: "weak", label: "Braucht Arbeit", icon: "↓" },
      { value: "okay", label: "Okay, aber ausbaufähig", icon: "→" },
      { value: "strong", label: "Sehr zufrieden", icon: "↑" },
    ],
  },
  {
    key: "priority",
    title: "Was soll sich als Erstes verbessern?",
    options: [
      { value: "process", label: "Interne Prozesse", icon: "⚙" },
      { value: "customers", label: "Mehr Kunden", icon: "＋" },
      { value: "software", label: "Eigene Software", icon: "⌘" },
      { value: "visibility", label: "Digitaler Auftritt", icon: "◉" },
    ],
  },
];

function Icon({ type }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (type === "code") return <svg {...common}><path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m14 5-4 14"/></svg>;
  if (type === "camera") return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="3"/><path d="m8 7 1.3-3h5.4L16 7"/><circle cx="12" cy="13.5" r="3.2"/></svg>;
  if (type === "spark") return <svg {...common}><path d="M12 3 10.4 8.4 5 10l5.4 1.6L12 17l1.6-5.4L19 10l-5.4-1.6L12 3Z"/><path d="m5 17-.7 2.3L2 20l2.3.7L5 23l.7-2.3L8 20l-2.3-.7L5 17Z"/></svg>;
  if (type === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (type === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
}

function Arrow() {
  return <span className="arrow" aria-hidden="true">→</span>;
}

function MiniChart({ compact = false }) {
  return (
    <svg className={compact ? "chart compact" : "chart"} viewBox="0 0 420 150" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#42e8b1" stopOpacity=".34"/>
          <stop offset="100%" stopColor="#42e8b1" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path className="chart-grid" d="M0 28H420M0 66H420M0 104H420M80 0V150M170 0V150M260 0V150M350 0V150"/>
      <path className="chart-area" d="M0 127 C34 115 55 121 82 98 C110 76 132 89 156 72 C185 52 203 70 230 54 C255 39 276 49 302 29 C328 12 346 32 372 18 C392 7 406 12 420 5 L420 150 L0 150 Z"/>
      <path className="chart-line" d="M0 127 C34 115 55 121 82 98 C110 76 132 89 156 72 C185 52 203 70 230 54 C255 39 276 49 302 29 C328 12 346 32 372 18 C392 7 406 12 420 5"/>
    </svg>
  );
}

function HeroDashboard() {
  const [tab, setTab] = useState("Übersicht");
  const tabs = ["Übersicht", "Bestand", "Bestellungen"];

  return (
    <div className="dashboard-shell hero-dashboard">
      <div className="dash-top">
        <strong>HSM</strong>
        <span>Das Charlie’s⌄</span>
        <span>Diese Woche⌄</span>
      </div>

      <div className="dash-body">
        <aside className="dash-sidebar">
          {["Übersicht", "Bestand", "Bestellungen", "Mitarbeiter", "Analysen", "Lieferanten"].map((item) => (
            <button key={item} className={tab === item ? "side-active" : ""} onClick={() => tabs.includes(item) && setTab(item)}>
              <i>{item === "Übersicht" ? "▣" : item === "Bestand" ? "□" : item === "Bestellungen" ? "◇" : "○"}</i>
              {item}
            </button>
          ))}
          <span className="dash-demo-label">Live Demo</span>
        </aside>

        <div className="dash-main">
          <div className="dash-title">
            <div><small>Restaurant OS</small><strong>{tab}</strong></div>
            <span>Demo-Daten</span>
          </div>

          {tab === "Übersicht" && (
            <>
              <div className="metric-grid">
                <div className="metric"><small>Umsatz</small><b>12.450 €</b><em>+12%</em></div>
                <div className="metric"><small>Bestand</small><b>284</b><em className="negative">-8%</em></div>
                <div className="metric"><small>Bestellungen</small><b>24</b><em>+6%</em></div>
              </div>
              <div className="dashboard-content">
                <div className="chart-card">
                  <div className="card-heading"><span>Umsatzentwicklung</span><b>+18%</b></div>
                  <MiniChart />
                  <div className="ai-note"><span>✦</span><div><b>KI Prognose</b><small>Bedarf der nächsten Woche analysiert.</small></div></div>
                </div>
                <div className="orders-card">
                  <div className="card-heading"><span>Top Produkte</span><b>Heute</b></div>
                  <div className="order-row"><span>🥐 Croissant</span><b>176</b></div>
                  <div className="order-row"><span>☕ Cappuccino</span><b>148</b></div>
                  <div className="order-row"><span>🥗 Bowl</span><b>82</b></div>
                  <div className="order-row"><span>🥤 Drinks</span><b>61</b></div>
                  <button onClick={() => setTab("Bestellungen")}>Bestellungen öffnen</button>
                </div>
              </div>
            </>
          )}

          {tab === "Bestand" && (
            <div className="inventory-demo">
              <div className="inventory-head"><span>Artikel</span><span>Bestand</span><span>Status</span></div>
              {[
                ["Kaffeebohnen", "18 kg", "Gut"],
                ["Hafermilch", "24 L", "Gut"],
                ["Croissants", "32 Stk.", "Nachbestellen"],
                ["Tomaten", "8 kg", "Prüfen"],
              ].map((row) => (
                <div className="inventory-row" key={row[0]}>
                  <b>{row[0]}</b><span>{row[1]}</span><em className={row[2] === "Gut" ? "ok" : "warn"}>{row[2]}</em>
                </div>
              ))}
            </div>
          )}

          {tab === "Bestellungen" && (
            <div className="orders-demo">
              <div className="order-big-card">
                <span>Bestellvorschlag</span>
                <strong>12 Artikel</strong>
                <p>Basierend auf Bestand, Verbrauch und Prognose.</p>
                <button>Vorschlag prüfen</button>
              </div>
              <div className="order-list">
                <div><span>Rindfleisch</span><b>12 kg</b></div>
                <div><span>Tomaten</span><b>8 kg</b></div>
                <div><span>Mozzarella</span><b>5 kg</b></div>
                <div><span>Olivenöl</span><b>3 l</b></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function HeroScrub() {
  const rootRef = useRef(null);
  const clipRef = useRef(null);
  const bootRef = useRef(null);
  const bootBarRef = useRef(null);
  const bootPctRef = useRef(null);
  const meterRef = useRef(null);
  const panelsRef = useRef([]);

  useEffect(() => {
    "use strict";

    // Temporary footage from the supplied reference prompt.
    // 1920×1080, 10.04s, 241 frames, all-intra: every frame is a keyframe,
    // which is why scroll scrubbing can land on an exact frame immediately.
    var VIDEO_URL = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/45567745-d826-44a2-a5ce-7ef670944e60.mp4";

    var root = rootRef.current;
    var clip = clipRef.current;
    var boot = bootRef.current;
    var bootBar = bootBarRef.current;
    var bootPct = bootPctRef.current;
    var meter = meterRef.current;
    var panels = panelsRef.current.filter(Boolean);

    if (!root || !clip || !boot || !bootBar || !bootPct || !meter) return undefined;

    // Dead zones between cue ranges are deliberate: only the video remains visible,
    // so two text panels are never readable at the same time.
    var CUES = [
      [0.00, 0.00, 0.15, 0.23],
      [0.35, 0.43, 0.57, 0.65],
      [0.77, 0.85, 1.10, 1.20]
    ];
    var DRIFT = 22;

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function ramp(p, a, b) {
      if (b <= a) return p >= b ? 1 : 0;
      return smooth(clamp((p - a) / (b - a), 0, 1));
    }

    var progress = 0;
    var seekTo = 0;
    var seekAt = 0;
    var duration = 0;
    var ready = false;
    var started = false;
    var attached = false;
    var objectUrl = "";
    var raf = 0;
    var destroyed = false;

    function readScroll() {
      var max = Math.max(1, root.offsetHeight - window.innerHeight);
      var rect = root.getBoundingClientRect();
      progress = clamp((-rect.top) / max, 0, 1);
      if (duration) seekTo = progress * duration;
    }

    function paint() {
      meter.style.transform = "scaleX(" + progress + ")";

      panels.forEach(function(el, i) {
        var c = CUES[i];
        if (!c) return;
        var enter = ramp(progress, c[0], c[1]);
        var leave = ramp(progress, c[2], c[3]);
        var o = enter * (1 - leave);
        var y = (1 - enter) * DRIFT - leave * DRIFT;
        el.style.opacity = String(o);
        el.style.transform = "translate3d(0," + y + "px,0)";
        el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      });
    }

    function frame() {
      if (destroyed) return;
      if (ready && duration) {
        var gap = seekTo - seekAt;
        if (Math.abs(gap) > 0.0008) {
          seekAt += gap * 0.115;
          if (clip.readyState >= 2 && !clip.seeking) {
            try { clip.currentTime = seekAt; } catch (e) {}
          }
        }
      }
      paint();
      raf = requestAnimationFrame(frame);
    }

    function setProgress(f) {
      var value = clamp(f, 0, 1);
      bootBar.style.transform = "scaleX(" + value + ")";
      bootPct.textContent = "LOADING " + Math.round(value * 100) + "%";
    }

    function start() {
      if (started) return;
      started = true;
      ready = true;
      boot.classList.add("done");
      readScroll();
      seekAt = seekTo;
    }

    function attach(src) {
      if (attached) return;
      attached = true;

      clip.addEventListener("loadedmetadata", function() {
        duration = clip.duration || 0;
        clip.pause();
        readScroll();
        seekAt = seekTo;
        try { clip.currentTime = seekAt; } catch (e) {}
      }, { once:true });

      clip.addEventListener("loadeddata", start, { once:true });
      clip.addEventListener("canplaythrough", start, { once:true });
      clip.addEventListener("error", start, { once:true });

      clip.src = src;
      clip.load();
      window.setTimeout(start, 12000);
    }

    function preload() {
      var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      var bail = window.setTimeout(function() {
        if (!attached) {
          if (controller) controller.abort();
          setProgress(1);
          attach(VIDEO_URL);
        }
      }, 15000);

      fetch(VIDEO_URL, controller ? { signal: controller.signal } : {})
        .then(function(res) {
          if (!res.ok || !res.body) throw new Error("Video preload failed");
          var total = Number(res.headers.get("content-length")) || 0;
          var reader = res.body.getReader();
          var chunks = [];
          var got = 0;

          // A fully buffered blob seeks far more smoothly than repeated range requests
          // while the user scrubs quickly through the footage.
          function pump() {
            return reader.read().then(function(r) {
              if (r.done) return new Blob(chunks, { type:"video/mp4" });
              chunks.push(r.value);
              got += r.value.byteLength;
              setProgress(total ? got / total : Math.min(got / 11e6, 0.95));
              return pump();
            });
          }
          return pump();
        })
        .then(function(blob) {
          clearTimeout(bail);
          setProgress(1);
          objectUrl = URL.createObjectURL(blob);
          attach(objectUrl);
        })
        .catch(function() {
          clearTimeout(bail);
          setProgress(1);
          attach(VIDEO_URL);
        });
    }

    // iOS will not reliably paint a frame from a video that has never been played,
    // so the first interaction nudges playback once and pauses immediately.
    function unlock() {
      var p = clip.play();
      if (p && p.then) p.then(function() { clip.pause(); }).catch(function() {});
      else clip.pause();
    }

    var unlockEvents = ["touchstart", "pointerdown", "wheel", "keydown"];
    unlockEvents.forEach(function(ev) {
      window.addEventListener(ev, unlock, { once:true, passive:true });
    });

    window.addEventListener("scroll", readScroll, { passive:true });
    window.addEventListener("resize", readScroll);

    readScroll();
    paint();
    preload();
    raf = requestAnimationFrame(frame);

    return function() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const panelData = [
    {
      eyebrow: <>Haas &amp; Saida Media <span>·</span> Digital Solutions</>,
      title: <>Your business.<br />Built better.</>,
      sub: "Custom Softwares, Social Media Betreuung, KI Beratung und Websites – entwickelt für echte Abläufe statt Standardpakete.",
      href: "#digital-check",
      cta: "Digital Check starten"
    },
    {
      eyebrow: <>Custom Softwares <span>·</span> KI Beratung</>,
      title: <>Build what your<br />business actually needs.</>,
      sub: "Wir digitalisieren Prozesse, automatisieren repetitive Arbeit und entwickeln Systeme, die zu deinem Unternehmen passen.",
      href: "#software",
      cta: "Leistungen ansehen"
    },
    {
      eyebrow: <>Social Media Betreuung <span>·</span> Websites</>,
      title: <>A digital presence<br />that actually works.</>,
      sub: "Strategie, Content, Design und Technologie greifen zusammen – für einen Auftritt, der professionell aussieht und sinnvoll funktioniert.",
      href: "#projects",
      cta: "Projekte ansehen"
    }
  ];

  return (
    <section className="scrub-hero" id="top" ref={rootRef}>
      <div className="scrub-pin">
        <div className="scrub-boot" ref={bootRef}>
          <div className="scrub-boot-bar"><i ref={bootBarRef}></i></div>
          <p ref={bootPctRef}>LOADING 0%</p>
        </div>

        <div className="scrub-stage">
          <video ref={clipRef} muted playsInline preload="auto" disablePictureInPicture />
          <div className="scrub-veil"></div>
          <div className="scrub-grain"></div>
        </div>

        <i className="scrub-meter" ref={meterRef}></i>

        <header className="scrub-chrome">
          <a className="scrub-mark" href="#top">
            <span className="scrub-mark-star" aria-hidden="true">✵</span>
            <span>HSM</span>
          </a>
          <nav className="scrub-nav">
            <a href="#software">Leistungen</a>
            <a href="#projects">Projekte</a>
            <a className="scrub-pill" href="#digital-check">Digital Check</a>
          </nav>
        </header>

        <main className="scrub-panels">
          {panelData.map((panel, index) => (
            <section
              className="scrub-panel"
              key={index}
              ref={(el) => { panelsRef.current[index] = el; }}
            >
              <div className="scrub-eyebrow">{panel.eyebrow}</div>
              <h1>{panel.title}</h1>
              <p className="scrub-sub">{panel.sub}</p>
              <div className="scrub-cta">
                <a className="scrub-pill" href={panel.href}>{panel.cta}</a>
              </div>
            </section>
          ))}
        </main>

        <footer className="scrub-foot">
          Haas &amp; Saida Media &nbsp;·&nbsp; Custom Softwares &nbsp;·&nbsp; KI Beratung &nbsp;·&nbsp; Social Media &nbsp;·&nbsp; Websites
        </footer>
      </div>
    </section>
  );
}


function ServiceMiniVisual({ id }) {
  if (id === "software") {
    return (
      <div className="service-mini mini-software">
        <div className="mini-window">
          <div className="mini-sidebar"></div>
          <div className="mini-work">
            <div className="mini-kpis"><i></i><i></i><i></i></div>
            <MiniChart compact />
          </div>
        </div>
      </div>
    );
  }
  if (id === "social") {
    return (
      <div className="service-mini mini-social">
        <div className="social-phone">
          <div className="phone-island"></div>
          <small>CONTENT PLAN</small>
          <b>12 Posts</b>
          <span>geplant</span>
          <div className="post-grid"><i></i><i></i><i></i><i></i></div>
        </div>
        <div className="social-float">+ neue Kampagne</div>
      </div>
    );
  }
  if (id === "ki") {
    return (
      <div className="service-mini mini-ai">
        <div className="ai-flow">
          <span>Dokument</span><i>→</i><b>✦ KI</b><i>→</i><span>Erledigt</span>
        </div>
        <div className="ai-lines"><i></i><i></i><i></i></div>
      </div>
    );
  }
  return (
    <div className="service-mini mini-web">
      <div className="browser-preview">
        <div className="browser-top"><i></i><i></i><i></i></div>
        <small>HSM</small>
        <b>Modern.<br/>Schnell.<br/>Klar.</b>
        <span>Website Preview</span>
      </div>
      <div className="browser-phone"></div>
    </div>
  );
}

function ServiceShowcase({ service }) {
  return (
    <div className={"service-showcase " + service.accent}>
      <div className="showcase-copy">
        <span className="showcase-kicker">{service.kicker}</span>
        <h3>{service.title}</h3>
        <p>{service.text}</p>
        <div className="showcase-bullets">
          {service.bullets.map((b) => <span key={b}>✓ {b}</span>)}
        </div>
        <a className="btn btn-dark" href={"mailto:kontakt@haas-saida-media.de?subject=" + encodeURIComponent("Anfrage: " + service.label)}>
          {service.label} anfragen <Arrow />
        </a>
      </div>
      <div className="showcase-visual">
        <ServiceMiniVisual id={service.id}/>
      </div>
    </div>
  );
}

function DigitalCheck() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const finished = step >= checkQuestions.length;
  const current = checkQuestions[Math.min(step, checkQuestions.length - 1)];

  const score = useMemo(() => {
    let value = 32;
    if (answers.manual === "many") value += 7;
    if (answers.manual === "some") value += 14;
    if (answers.manual === "few") value += 22;
    if (answers.ai === "none") value += 5;
    if (answers.ai === "tools") value += 14;
    if (answers.ai === "workflows") value += 22;
    if (answers.web === "weak") value += 6;
    if (answers.web === "okay") value += 14;
    if (answers.web === "strong") value += 22;
    return Math.min(96, value);
  }, [answers]);

  const recommendations = useMemo(() => {
    const list = [];
    if (answers.manual === "many" || answers.manual === "some") list.push(["Prozesse automatisieren", "Wiederkehrende manuelle Schritte zuerst analysieren."]);
    if (answers.ai === "none" || answers.ai === "tools") list.push(["KI sinnvoll integrieren", "Konkrete Workflows statt isolierter Einzeltools aufbauen."]);
    if (answers.web === "weak" || answers.web === "okay") list.push(["Digitalen Auftritt stärken", "Website, Sichtbarkeit und klare Anfragenwege verbessern."]);
    if (answers.priority === "software") list.unshift(["Eigene Software prüfen", "Ein internes System kann Abläufe zentral zusammenführen."]);
    if (answers.priority === "customers") list.unshift(["Kundengewinnung strukturieren", "Website und Social Media entlang eines klaren Funnels verbinden."]);
    if (!list.length) list.push(["Systeme weiter vernetzen", "Bestehende digitale Abläufe sauber miteinander verbinden."]);
    return list.slice(0, 3);
  }, [answers]);

  function choose(value) {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  }

  function next() {
    if (!answers[current.key]) return;
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  return (
    <section className="digital-section" id="digital-check">
      <div className="container digital-layout">
        <div className="digital-copy">
          <div className="eyebrow dark">HSM DIGITAL CHECK</div>
          <h2>Wie digital ist dein Unternehmen wirklich?</h2>
          <p>Beantworte fünf kurze Fragen. Danach bekommst du direkt eine erste Einordnung und konkrete Ansatzpunkte.</p>
          <div className="check-benefits">
            <span>Keine Anmeldung</span>
            <span>Direktes Ergebnis</span>
            <span>5 kurze Schritte</span>
          </div>
        </div>

        <div className="check-shell">
          {!finished ? (
            <>
              <div className="check-topline">
                <div className="check-progress"><i style={{ width: ((step + 1) / checkQuestions.length) * 100 + "%" }}></i></div>
                <span>{step + 1}/{checkQuestions.length}</span>
              </div>

              <div className="step-dots">
                {checkQuestions.map((_, index) => <i key={index} className={index <= step ? "active" : ""}>{index + 1}</i>)}
              </div>

              <div className="question-wrap">
                <span className="question-label">FRAGE {step + 1}</span>
                <h3>{current.title}</h3>
                <div className={"choice-grid choice-count-" + current.options.length}>
                  {current.options.map((option) => (
                    <button
                      key={option.value}
                      className={answers[current.key] === option.value ? "selected" : ""}
                      onClick={() => choose(option.value)}
                    >
                      <b>{option.icon}</b>
                      <span>{option.label}</span>
                      {option.sub && <small>{option.sub}</small>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="check-controls">
                <button className="text-button" onClick={back} disabled={step === 0}>← Zurück</button>
                <button className="btn btn-dark" onClick={next} disabled={!answers[current.key]}>
                  {step === checkQuestions.length - 1 ? "Ergebnis anzeigen" : "Weiter"} <Arrow />
                </button>
              </div>
            </>
          ) : (
            <div className="result-view">
              <div className="result-head">
                <div>
                  <span className="question-label">DEIN ERGEBNIS</span>
                  <h3>Dein Digital Score</h3>
                  <p>Eine erste Orientierung auf Basis deiner Antworten.</p>
                </div>
                <div className="score-ring" style={{ "--score": score }}>
                  <div><b>{score}</b><span>/100</span></div>
                </div>
              </div>

              <div className="result-bars">
                <div><span>Automatisierungs-Potenzial</span><b className={answers.manual === "few" ? "medium" : "high"}>{answers.manual === "few" ? "Mittel" : "Hoch"}</b></div>
                <div><span>KI-Potenzial</span><b className={answers.ai === "workflows" ? "medium" : "high"}>{answers.ai === "workflows" ? "Mittel" : "Hoch"}</b></div>
                <div><span>Website-Potenzial</span><b className={answers.web === "strong" ? "low" : "medium"}>{answers.web === "strong" ? "Niedrig" : "Mittel"}</b></div>
              </div>

              <div className="recommendations">
                {recommendations.map(([title, text], index) => (
                  <div key={title}><i>{index + 1}</i><span><b>{title}</b><small>{text}</small></span></div>
                ))}
              </div>

              <div className="result-actions">
                <a className="btn btn-dark" href="mailto:kontakt@haas-saida-media.de?subject=HSM%20Digital%20Check">
                  Kostenlose Analyse anfragen <Arrow />
                </a>
                <button className="text-button" onClick={restart}>Check neu starten</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ kind }) {
  if (kind === "dashboard") {
    return (
      <div className="project-device-scene">
        <div className="project-tablet">
          <HeroDashboard />
        </div>
        <div className="project-float-card"><span>KI Prognose</span><b>Bestellbedarf erkannt</b></div>
      </div>
    );
  }
  if (kind === "school") {
    return (
      <div className="project-art school-art">
        <div className="school-screen">
          <div className="school-top"><b>Yellow Drive</b><span>Heute</span></div>
          <div className="school-kpis"><i>24<small>Schüler</small></i><i>8<small>Fahrten</small></i><i>3<small>Prüfungen</small></i></div>
          <div className="school-list"><span>10:00 · Fahrstunde</span><span>13:30 · Theorie</span><span>16:00 · Prüfung</span></div>
        </div>
      </div>
    );
  }
  if (kind === "nfc") {
    return (
      <div className="project-art nfc-art">
        <div className="nfc-plinth"><span>GASTRO</span><b>TAP</b><small>tap here</small></div>
        <div className="nfc-wave one"></div><div className="nfc-wave two"></div><div className="nfc-wave three"></div>
      </div>
    );
  }
  return (
    <div className="project-art campaign-art">
      <div className="campaign-device">
        <div className="campaign-top"><b>HSM Campaigns</b><span>•••</span></div>
        <div className="campaign-kpi"><small>Aktive Kampagnen</small><b>3</b></div>
        <div className="creator-row"><i></i><span><b>Creator Bewerbung</b><small>Fashion · Instagram</small></span><em>Neu</em></div>
        <div className="creator-row"><i></i><span><b>Content Review</b><small>Video eingereicht</small></span><em>Check</em></div>
      </div>
    </div>
  );
}

function App() {
  const [activeService, setActiveService] = useState("software");
  const [activeProject, setActiveProject] = useState("charlies");
  const [menuOpen, setMenuOpen] = useState(false);

  const service = services.find((item) => item.id === activeService) || services[0];
  const project = projects.find((item) => item.id === activeProject) || projects[0];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main>
      <HeroScrub />

      <section className="services-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow dark">UNSERE LEISTUNGEN</div>
              <h2>Komplette digitale Lösungen<br/>für moderne Unternehmen.</h2>
            </div>
            <p>Vier Bereiche, die einzeln funktionieren – aber noch stärker werden, wenn sie sauber zusammenspielen.</p>
          </div>

          <div className="service-grid">
            {services.map((item) => (
              <button
                type="button"
                className={"service-card " + (activeService === item.id ? "active" : "")}
                id={item.id}
                key={item.id}
                onClick={() => setActiveService(item.id)}
              >
                <div className={"icon-box " + item.accent}><Icon type={item.icon}/></div>
                <div className="service-card-title"><b>{item.label}</b><span>→</span></div>
                <p>{item.text}</p>
                <ServiceMiniVisual id={item.id}/>
                <div className="service-card-foot"><span>Details ansehen</span><i>{activeService === item.id ? "Ausgewählt" : "Öffnen"}</i></div>
              </button>
            ))}
          </div>

          <ServiceShowcase service={service}/>
        </div>
      </section>

      <DigitalCheck />

      <section className="projects-section" id="projects">
        <div className="container">
          <div className="projects-head">
            <div>
              <div className="eyebrow">AUSGEWÄHLTE PROJEKTE</div>
              <h2>Echte Lösungen.<br/>In der Praxis.</h2>
            </div>
            <a className="btn btn-dark-outline" href="#contact">Projekt besprechen <Arrow /></a>
          </div>

          <div className="featured-project">
            <div className="featured-copy">
              <span className="project-pill">{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.text}</p>
              <small>{project.detail}</small>
              <div className="featured-actions">
                <a className="btn btn-dark-outline" href={"mailto:kontakt@haas-saida-media.de?subject=" + encodeURIComponent("Projektanfrage: " + project.title)}>
                  Ähnliches Projekt besprechen <Arrow />
                </a>
              </div>
            </div>
            <ProjectVisual kind={project.kind}/>
          </div>

          <div className="project-switcher">
            {projects.map((item) => (
              <button key={item.id} className={activeProject === item.id ? "active" : ""} onClick={() => setActiveProject(item.id)}>
                <span>{item.category}</span><b>{item.title}</b><small>{item.text}</small><i>→</i>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="why-section" id="about">
        <div className="container">
          <div className="eyebrow">WARUM HSM</div>
          <div className="why-top">
            <div>
              <h2>Mehr als eine klassische Agentur.</h2>
              <p>Wir denken nicht in isolierten Einzelleistungen, sondern in Systemen: Was kostet heute unnötig Zeit, was verhindert Wachstum und welche digitale Lösung schafft wirklich einen Vorteil?</p>
            </div>
            <div className="why-cards">
              <div><small>01</small><b>Verstehen</b><span>Abläufe und Ziel zuerst.</span></div>
              <div><small>02</small><b>Bauen</b><span>Individuell statt Standardpaket.</span></div>
              <div><small>03</small><b>Verbessern</b><span>Nach dem Launch weiterdenken.</span></div>
            </div>
          </div>

          <div className="why-grid">
            <article><i>⌘</i><div><b>Technisches Know-how</b><p>Wir bauen nicht nur Oberflächen, sondern funktionierende Systeme und Workflows.</p></div></article>
            <article><i>✦</i><div><b>Individuelle Lösungen</b><p>Kein starres Paket. Die Umsetzung orientiert sich am echten Bedarf des Unternehmens.</p></div></article>
            <article><i>◎</i><div><b>Direkter Kontakt</b><p>Kurze Wege, nachvollziehbare Entscheidungen und eine klare gemeinsame Umsetzung.</p></div></article>
          </div>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="container cta-grid">
          <div className="cta-copy">
            <div className="eyebrow dark">BEREIT FÜR DEN NÄCHSTEN SCHRITT?</div>
            <h2>Lass uns dein Unternehmen digital stärker machen.</h2>
            <p>Ob individuelle Software, KI-Lösung, Social Media Betreuung oder eine neue Website – wir starten bei deinem konkreten Problem.</p>
            <div className="hero-buttons">
              <a className="btn btn-dark" href="mailto:kontakt@haas-saida-media.de">Projekt besprechen <Arrow /></a>
              <a className="btn btn-white-outline" href="#digital-check">Digital Check starten</a>
            </div>
          </div>

          <div className="cta-visual">
            <div className="cta-orb"></div>
            <div className="cta-phone">
              <div className="phone-island"></div>
              <div className="cta-phone-head"><b>HSM</b><span>online</span></div>
              <div className="cta-chat"><small>Neue Anfrage</small><b>Restaurant Website</b><span>vor 2 Min.</span></div>
              <div className="cta-chat second"><small>Digital Check</small><b>Analyse abgeschlossen</b><span>jetzt</span></div>
            </div>
            <div className="cta-glass-card"><span>Neue Anfrage</span><b>Custom Software</b><small>Projekt besprechen →</small></div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <a className="footer-logo" href="#top">HSM</a>
          <span>Custom Softwares · Social Media Betreuung · KI Beratung · Websites</span>
          <a href="#top">Nach oben ↑</a>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);