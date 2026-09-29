import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function HeroScrub() {
  const rootRef = useRef(null);
  const clipRef = useRef(null);
  const bootRef = useRef(null);
  const bootBarRef = useRef(null);
  const bootPctRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    "use strict";

    var VIDEO_URL = "/hsm-hero.mp4";

    var root = rootRef.current;
    var clip = clipRef.current;
    var boot = bootRef.current;
    var bootBar = bootBarRef.current;
    var bootPct = bootPctRef.current;
    var cta = ctaRef.current;

    if (!root || !clip || !boot || !bootBar || !bootPct || !cta) return undefined;

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function ramp(p, a, b) {
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

    function setScrubProgress(next) {
      progress = clamp(next, 0, 1);
      if (duration) seekTo = progress * Math.max(0, duration - 0.03);
      paint();
    }

    function readScroll() {
      if (duration) seekTo = progress * Math.max(0, duration - 0.03);
    }

    function onWheel(event) {
      var rect = root.getBoundingClientRect();
      var touchingHero = rect.top <= 2 && rect.bottom >= -2;
      if (!touchingHero) return;

      var forward = event.deltaY > 0;
      var backward = event.deltaY < 0;
      var shouldConsume =
        (forward && progress < 0.999) ||
        (backward && progress > 0.001 && rect.top >= -2);

      if (!shouldConsume) return;

      event.preventDefault();
      setScrubProgress(progress + event.deltaY / 1700);
    }

    function paint() {
      var reveal = ramp(progress, 0.92, 0.975);
      cta.style.opacity = String(reveal);
      cta.style.transform =
        "translate(-50%," + (14 * (1 - reveal)).toFixed(1) + "px) scale(" +
        (0.96 + reveal * 0.04).toFixed(3) + ")";
      cta.style.pointerEvents = reveal > 0.82 ? "auto" : "none";
    }

    function frame() {
      if (destroyed) return;

      if (ready && duration) {
        var gap = seekTo - seekAt;
        if (Math.abs(gap) > 0.001) {
          seekAt += gap * 0.16;
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
      try { clip.currentTime = seekAt; } catch (e) {}
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

          function pump() {
            return reader.read().then(function(r) {
              if (r.done) return new Blob(chunks, { type:"video/mp4" });
              chunks.push(r.value);
              got += r.value.byteLength;
              setProgress(total ? got / total : Math.min(got / 12e6, 0.95));
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

    function unlock() {
      var p = clip.play();
      if (p && p.then) p.then(function() { clip.pause(); }).catch(function() {});
      else clip.pause();
    }

    ["touchstart", "pointerdown", "wheel", "keydown"].forEach(function(ev) {
      window.addEventListener(ev, unlock, { once:true, passive:true });
    });

    window.addEventListener("wheel", onWheel, { passive:false });
    window.addEventListener("resize", readScroll);

    readScroll();
    paint();
    preload();
    raf = requestAnimationFrame(frame);

    return function() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", readScroll);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <section className="scrub-hero" id="top" ref={rootRef}>
      <div className="scrub-pin">
        <div className="scrub-boot" ref={bootRef}>
          <div className="scrub-boot-bar"><i ref={bootBarRef}></i></div>
          <p ref={bootPctRef}>LOADING 0%</p>
        </div>

        <div className="scrub-stage">
          <video ref={clipRef} muted playsInline preload="auto" disablePictureInPicture />
        </div>

        <a className="scrub-final-cta" href="#contact" ref={ctaRef}>
          Anfrage senden <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}


const serviceCards = [
  {
    id: "academy",
    label: "HSM Academy",
    subtitle: "KI Seminare, Beratung & digitale Kurse",
    meta: "Unternehmen & Privat",
    href: "/academy",
    image: "https://images.unsplash.com/photo-1769839271768-aee5469799ee?auto=format&fit=crop&w=1800&q=92",
    position: "center 34%",
  },
  {
    id: "software",
    label: "Custom Software",
    subtitle: "Individuelle Systeme für echte Abläufe",
    meta: "Software",
    href: "/software",
    image: "https://images.unsplash.com/photo-1753715613434-9c7cb58876b9?auto=format&fit=crop&w=1800&q=92",
    position: "center",
  },
  {
    id: "social",
    label: "Social Media",
    subtitle: "Content, Strategie & Betreuung",
    meta: "Social",
    href: "/social-media",
    image: "https://images.unsplash.com/photo-1781606424661-de1dc2b4c6e1?auto=format&fit=crop&w=1800&q=92",
    position: "center",
  },
  {
    id: "web",
    label: "Websites",
    subtitle: "Design, Entwicklung & digitale Präsenz",
    meta: "Web",
    href: "/websites",
    image: "https://images.unsplash.com/photo-1727527606000-8bee0d891207?auto=format&fit=crop&w=1800&q=92",
    position: "center",
  },
];

const serviceThickness = [-2.2, -1.1, 0, 1.1, 2.2];

function ServiceCylinderCard({ item, index, cardRef }) {
  return (
    <a
      className="cylinder-card"
      href={item.href}
      ref={cardRef}
      aria-label={item.label + ": " + item.subtitle}
    >
      {serviceThickness.map((depth, layerIndex) => {
        const isBack = layerIndex === 0;
        const isFront = layerIndex === serviceThickness.length - 1;

        if (!isFront && !isBack) {
          return (
            <span
              className="cylinder-card-edge"
              key={depth}
              style={{ transform: "translateZ(" + depth + "px)" }}
              aria-hidden="true"
            />
          );
        }

        if (isBack) {
          return (
            <span
              className="cylinder-card-face cylinder-card-back"
              key={depth}
              style={{ transform: "translateZ(" + depth + "px) rotateY(180deg)" }}
              aria-hidden="true"
            >
              <img src={item.image} alt="" draggable="false" style={{ objectPosition: item.position }} />
              <span className="cylinder-card-back-blur"></span>
              <span className="cylinder-card-back-brand">HSM</span>
              <span className="cylinder-card-back-copy">
                <small>{item.meta}</small>
                <b>{item.label}</b>
                <em>{item.subtitle}</em>
              </span>
            </span>
          );
        }

        return (
          <span
            className="cylinder-card-face cylinder-card-front"
            key={depth}
            style={{ transform: "translateZ(" + depth + "px)" }}
          >
            <img src={item.image} alt="" draggable="false" style={{ objectPosition: item.position }} />
            <span className="cylinder-card-front-shade"></span>
            <span className="cylinder-card-meta">{item.meta}</span>
            <span className="cylinder-card-glass">
              <span>
                <b>{item.label}</b>
                <small>{item.subtitle}</small>
              </span>
              <i>→</i>
            </span>
          </span>
        );
      })}
    </a>
  );
}

function CapabilitiesSection() {
  const stageRef = useRef(null);
  const cardsRefs = useRef([]);
  const frameRef = useRef(0);
  const progressRef = useRef(0);
  const hoverRef = useRef(false);
  const metricsRef = useRef({ cardW: 390, cardH: 520 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }

    function updateMetrics() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cardW = clamp(Math.round(w * 0.19 + 150), 250, 410);
      const cardH = Math.round(cardW * 1.34);
      metricsRef.current = { cardW, cardH };

      cardsRefs.current.forEach((card) => {
        if (!card) return;
        card.style.width = cardW + "px";
        card.style.height = cardH + "px";
      });
    }

    function handleMouseMove(event) {
      const rect = stage.getBoundingClientRect();
      const rx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width / 2);
      const ry = (event.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height / 2);
      mouseRef.current.targetX = clamp(rx, -1, 1);
      mouseRef.current.targetY = clamp(ry, -1, 1);
    }

    function handleMouseLeave() {
      hoverRef.current = false;
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    }

    function handleWheel(event) {
      const rect = stage.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!visible) return;

      const primary = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(primary) < 3) return;

      progressRef.current += primary * 0.0009;
    }

    function renderLoop() {
      const count = serviceCards.length;
      const cards = cardsRefs.current;
      const { cardW } = metricsRef.current;
      const viewportW = stage.clientWidth || window.innerWidth;
      const D = 1350;
      const gap = Math.max(42, cardW * 0.13);
      const edgePeek = -42;

      progressRef.current += hoverRef.current ? 0.00016 : 0.0011;

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.075;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.075;

      const continuous = progressRef.current;
      const roundedIndex = Math.round(continuous);
      const diffFromRound = continuous - roundedIndex;
      const easedDiff =
        Math.sign(diffFromRound) *
        Math.pow(Math.abs(diffFromRound) * 2, 4.2) /
        2;
      const virtualActiveIndex = roundedIndex + easedDiff;

      for (let i = 0; i < count; i += 1) {
        const card = cards[i];
        if (!card) continue;

        let offset = i - virtualActiveIndex;
        const half = count / 2;

        while (offset > half) offset -= count;
        while (offset < -half) offset += count;

        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset) || 1;

        if (absOffset > 2.6) {
          card.style.visibility = "hidden";
          card.style.pointerEvents = "none";
          continue;
        }

        card.style.visibility = "visible";
        card.style.pointerEvents = "auto";

        let x = 0;
        let z = 0;
        let rotY = 0;

        if (absOffset <= 1) {
          const t = absOffset;
          const easedT = smoothstep(t);

          x = sign * easedT * (cardW + gap);
          z = 390 + easedT * (210 - 390);
          rotY = -sign * easedT * 132;
        } else if (absOffset <= 2) {
          const t = absOffset - 1;
          const easedT = smoothstep(t);

          const xStart = cardW + gap;
          const zStart = 210;
          const zEnd = -65;
          const rotStart = 132;
          const rotEnd = 175;

          const scaleEnd = D / (D - zEnd);
          const xEnd = (viewportW / 2 - edgePeek) / scaleEnd - cardW / 2;

          x = sign * (xStart + easedT * (xEnd - xStart));
          z = zStart + easedT * (zEnd - zStart);
          rotY = -sign * (rotStart + easedT * (rotEnd - rotStart));
        } else {
          const t = Math.min(absOffset - 2, 1);
          const easedT = smoothstep(t);

          const zStart = -65;
          const zEnd = -260;
          const scaleStart = D / (D - zStart);
          const scaleEnd = D / (D - zEnd);
          const xStart = (viewportW / 2 - edgePeek) / scaleStart - cardW / 2;
          const xEnd = (viewportW / 2 + 150) / scaleEnd + cardW / 2;

          x = sign * (xStart + easedT * (xEnd - xStart));
          z = zStart + easedT * (zEnd - zStart);
          rotY = -sign * (175 + easedT * 20);
        }

        const centerFactor = Math.max(0, 1 - absOffset);
        const tiltX = -mouseRef.current.y * 10 * centerFactor;
        const tiltY = mouseRef.current.x * 13 * centerFactor;

        card.style.zIndex = String(Math.round(z + 500));
        card.style.opacity = String(clamp(1 - Math.max(0, absOffset - 1.75) * 0.8, 0, 1));
        card.style.transform =
          "translate3d(" + x.toFixed(2) + "px,0," + z.toFixed(2) + "px) " +
          "rotateX(" + tiltX.toFixed(2) + "deg) " +
          "rotateY(" + (rotY + tiltY).toFixed(2) + "deg) " +
          "rotateZ(-2deg)";
      }

      frameRef.current = requestAnimationFrame(renderLoop);
    }

    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    stage.addEventListener("mousemove", handleMouseMove);
    stage.addEventListener("mouseenter", () => { hoverRef.current = true; });
    stage.addEventListener("mouseleave", handleMouseLeave);
    stage.addEventListener("wheel", handleWheel, { passive: true });

    frameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", updateMetrics);
      stage.removeEventListener("mousemove", handleMouseMove);
      stage.removeEventListener("mouseleave", handleMouseLeave);
      stage.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <section className="capabilities-section" id="services">
      <div className="capabilities-heading">
        <span>HSM</span>
        <h2>Was wir machen</h2>
        <p>Vier Bereiche. Ein digitaler Partner.</p>
      </div>

      <div className="cylinder-carousel-wrap">
        <div className="cylinder-carousel-stage" ref={stageRef}>
          <div className="cylinder-carousel-origin">
            {serviceCards.map((item, index) => (
              <ServiceCylinderCard
                item={item}
                index={index}
                key={item.id}
                cardRef={(el) => { cardsRefs.current[index] = el; }}
              />
            ))}
          </div>
        </div>

        <p className="cylinder-carousel-hint">Bewegen · ansehen · öffnen</p>
      </div>
    </section>
  );
}

function usePageMeta({ title, description, path, robots = "index,follow" }) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute("content", robots);

    const canonicalUrl = "https://haas-saida-media.de" + path;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    const setProperty = (property, content) => {
      let tag = document.querySelector('meta[property="' + property + '"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setProperty("og:title", title);
    setProperty("og:description", description);
    setProperty("og:url", canonicalUrl);
    setProperty("og:type", "website");
  }, [title, description, path, robots]);
}

const academyFormats = [
  {
    label: "KI Schulung für Unternehmen",
    title: "Teams sicher und sinnvoll mit KI arbeiten lassen.",
    text: "Für Mitarbeitende, Führungskräfte und Teams, die ChatGPT und andere KI-Werkzeuge im Arbeitsalltag einsetzen wollen.",
    tags: ["KI Schulung Unternehmen", "ChatGPT Workshop", "Mitarbeiter Weiterbildung"],
  },
  {
    label: "KI Beratung",
    title: "Erst verstehen, wo KI wirklich etwas bringt.",
    text: "Wir prüfen Aufgaben und Prozesse, bevor neue Tools eingeführt werden. So entsteht ein klarer, sinnvoller Einsatz statt Tool-Chaos.",
    tags: ["KI Beratung", "Prozessanalyse", "Automatisierung"],
  },
  {
    label: "KI Beratung für Unternehmen",
    title: "Von der Idee zum sinnvollen KI-Einsatz.",
    text: "Wir prüfen Prozesse, priorisieren konkrete Anwendungsfälle und zeigen, welche KI-Werkzeuge oder Automatisierungen zum Unternehmen passen.",
    tags: ["KI Beratung München", "KI Strategie", "Automatisierung"],
  },
];

const academyFaqs = [
  {
    q: "Für wen ist eine KI-Schulung im Unternehmen sinnvoll?",
    a: "Für Teams und Mitarbeitende, die KI bereits nutzen oder künftig im Arbeitsalltag einsetzen sollen. Inhalte und Übungen werden an Rollen, Vorkenntnisse und typische Aufgaben angepasst.",
  },
  {
    q: "Bietet HSM Academy KI-Schulungen in München an?",
    a: "Ja. Workshops können vor Ort in München und Oberbayern sowie remote durchgeführt werden. Format und Umfang werden passend zum Unternehmen geplant.",
  },
  {
    q: "Geht es nur um ChatGPT?",
    a: "Nein. ChatGPT ist häufig ein guter Einstieg, aber die Schulung kann auch andere KI-Werkzeuge, sichere Nutzung, Prozessautomatisierung und konkrete Anwendungsfälle aus dem Unternehmen behandeln.",
  },
  {
    q: "Was hat der EU AI Act mit KI-Weiterbildung zu tun?",
    a: "Artikel 4 des EU AI Act verpflichtet Anbieter und Betreiber von KI-Systemen dazu, Maßnahmen zur Förderung von KI-Kompetenz bei Mitarbeitenden und weiteren Personen zu treffen, die KI-Systeme in ihrem Auftrag nutzen. Eine passende Schulung kann ein Baustein dafür sein.",
  },
];

function AcademyPage() {
  const [audience, setAudience] = useState("unternehmen");

  usePageMeta({
    title: "KI Schulung München für Unternehmen & Teams | HSM Academy",
    description: "Praxisnahe KI-Schulungen, ChatGPT Workshops und KI-Beratung für Unternehmen in München, Oberbayern und remote. Dazu digitale Kurse für Privatpersonen.",
    path: "/academy",
  });

  return (
    <main className="academy-page">
      <nav className="academy-nav">
        <a className="academy-nav-logo" href="/">HSM</a>
        <div className="academy-nav-links">
          <a href="#unternehmen">Unternehmen</a>
          <a href="#privat">Privat</a>
          <a href="#faq">FAQ</a>
        </div>
        <a className="academy-nav-cta" href="mailto:kontakt@haas-saida-media.de?subject=HSM%20Academy%20Anfrage">Seminar anfragen</a>
      </nav>

      <section className="academy-hero">
        <div className="academy-hero-backdrop"></div>
        <div className="academy-hero-grid">
          <div className="academy-hero-copy">
            <span className="academy-page-kicker">HSM Academy</span>
            <h1>KI-Schulungen für Unternehmen.<br/>Digitale Kurse für Menschen.</h1>
            <p>Praxisnah, verständlich und auf den echten Alltag zugeschnitten – vor Ort in München und Oberbayern oder remote.</p>

            <div className="academy-hero-actions">
              <a href="#unternehmen">Für Unternehmen</a>
              <a href="#privat" className="light">Für Privatpersonen</a>
            </div>

            <div className="academy-keywords" aria-label="Schwerpunkte">
              <span>ChatGPT Schulung</span>
              <span>KI Weiterbildung</span>
              <span>KI Beratung</span>
            </div>
          </div>

          <div className="academy-hero-visual">
            <img
              src="https://images.unsplash.com/photo-1769839271768-aee5469799ee?auto=format&fit=crop&w=1800&q=92"
              alt="Dozent erklärt Inhalte in einem Business-Seminar"
            />
            <div className="academy-hero-shade"></div>

            <div className="academy-hero-panel panel-team">
              <small>Unternehmen</small>
              <b>KI im Arbeitsalltag</b>
              <span>Workshop für Teams</span>
            </div>

            <div className="academy-hero-panel panel-private">
              <small>Privat</small>
              <b>Digital sicherer werden</b>
              <span>KI, Smartphone & Social Media</span>
            </div>

            <div className="academy-hero-panel panel-ai">
              <small>KI Beratung</small>
              <b>Potenziale erkennen</b>
            </div>
          </div>
        </div>
      </section>

      <section className="academy-switch-section">
        <div className="academy-switch-copy">
          <span>HSM Academy</span>
          <h2>Was passt zu dir?</h2>
        </div>

        <div className="academy-segmented">
          <button className={audience === "unternehmen" ? "active" : ""} onClick={() => setAudience("unternehmen")}>Unternehmen</button>
          <button className={audience === "privat" ? "active" : ""} onClick={() => setAudience("privat")}>Privatpersonen</button>
        </div>

        <div className="academy-focus-card">
          {audience === "unternehmen" ? (
            <>
              <div>
                <span>KI Schulung für Unternehmen</span>
                <h3>Von den Grundlagen bis zum konkreten Einsatz im Team.</h3>
              </div>
              <p>ChatGPT, KI-Tools, sichere Nutzung und echte Anwendungsfälle aus dem Unternehmen. Kein allgemeiner Vortrag, sondern Weiterbildung mit direktem Bezug zum Arbeitsalltag.</p>
              <a href="#unternehmen">Unternehmensangebote ansehen</a>
            </>
          ) : (
            <>
              <div>
                <span>Digitale Weiterbildung</span>
                <h3>Technik verstehen, ohne Technik-Sprache lernen zu müssen.</h3>
              </div>
              <p>KI, Smartphone, WhatsApp, Social Media und digitale Sicherheit werden Schritt für Schritt erklärt – für Einsteiger und ältere Menschen.</p>
              <a href="#privat">Private Kurse ansehen</a>
            </>
          )}
        </div>
      </section>

      <section className="academy-formats" id="unternehmen">
        <div className="academy-section-head">
          <span>Unternehmen</span>
          <h2>KI-Schulung, Beratung und Weiterbildung für Teams.</h2>
          <p>Für Unternehmen in München, Oberbayern und deutschlandweit remote.</p>
        </div>

        <div className="academy-format-grid">
          {academyFormats.map((format, index) => (
            <article className="academy-format-card" key={format.label}>
              <div className={"academy-format-visual visual-" + index}>
                <span>{format.label}</span>
                <div className="academy-format-ui">
                  <i></i><i></i><i></i>
                  <b>{index === 0 ? "Team Workshop" : index === 1 ? "Prozess Check" : "KI Beratung"}</b>
                </div>
              </div>
              <div className="academy-format-copy">
                <span>{format.label}</span>
                <h3>{format.title}</h3>
                <p>{format.text}</p>
                <div className="academy-format-tags">
                  {format.tags.map((tag) => <i key={tag}>{tag}</i>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="academy-ai-act">
        <div className="academy-ai-act-card">
          <div>
            <span>KI-Kompetenz im Unternehmen</span>
            <h2>EU AI Act nicht nur abhaken. Mitarbeitende wirklich befähigen.</h2>
          </div>
          <p>Artikel 4 des EU AI Act verlangt Maßnahmen zur Förderung von KI-Kompetenz bei Personen, die KI-Systeme im Auftrag eines Unternehmens nutzen. HSM Academy verbindet dieses Thema mit konkreten Anwendungen im Arbeitsalltag.</p>
        </div>
      </section>

      <section className="academy-private-section" id="privat">
        <div className="academy-private-visual">
          <div className="academy-private-phone">
            <div></div>
            <span>Nachrichten</span>
            <span>Fotos</span>
            <span>Social Media</span>
          </div>
          <div className="academy-private-glass one"><small>KI</small><b>ChatGPT verstehen</b></div>
          <div className="academy-private-glass two"><small>Smartphone</small><b>Sicher im Alltag</b></div>
        </div>

        <div className="academy-private-copy">
          <span>Für Privatpersonen</span>
          <h2>Digital einfach verstehen.</h2>
          <p>Persönliche Kurse zu KI, Smartphone, Social Media und digitaler Sicherheit. Ruhig erklärt, ohne Fachbegriffe und angepasst an das eigene Tempo.</p>
          <div className="academy-private-tags">
            <span>KI & ChatGPT</span>
            <span>Smartphone</span>
            <span>Social Media</span>
            <span>Digitale Sicherheit</span>
          </div>
          <a href="mailto:kontakt@haas-saida-media.de?subject=HSM%20Academy%20Privatkurs">Privaten Kurs anfragen</a>
        </div>
      </section>

      <section className="academy-faq" id="faq">
        <div className="academy-faq-head">
          <span>Fragen</span>
          <h2>KI-Schulung & HSM Academy</h2>
        </div>
        <div className="academy-faq-list">
          {academyFaqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}<span>+</span></summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="academy-final">
        <div className="academy-final-card">
          <span>HSM Academy</span>
          <h2>Welches Wissen braucht dein Team?</h2>
          <p>Wir stellen das Format passend zu Unternehmen, Teilnehmern und Einsatzgebiet zusammen.</p>
          <a href="mailto:kontakt@haas-saida-media.de?subject=KI%20Schulung%20Unternehmen">KI-Schulung anfragen</a>
        </div>
      </section>
    </main>
  );
}

function ServiceDestination({ item }) {
  usePageMeta({
    title: item.label + " | HSM",
    description: item.subtitle + " – HSM.",
    path: item.href,
    robots: "noindex,follow",
  });

  return (
    <main className="service-destination">
      <a className="service-destination-back" href="/">HSM</a>
      <div className="service-destination-card">
        <span>{item.meta}</span>
        <h1>{item.label}</h1>
        <p>{item.subtitle}</p>
        <a href="/">Zurück zur Startseite</a>
      </div>
    </main>
  );
}

function App() {
  const path = window.location.pathname;
  const activeService = serviceCards.find((item) => item.href === path);

  if (path === "/academy") {
    return <AcademyPage />;
  }

  if (activeService) {
    return <ServiceDestination item={activeService} />;
  }

  return (
    <main>
      <HeroScrub />
      <CapabilitiesSection />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
