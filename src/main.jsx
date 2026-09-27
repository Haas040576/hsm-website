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


const capabilityItems = [
  {
    id: "academy",
    label: "HSM Academy",
    meta: "Seminare & Weiterbildung",
    title: "Digitale Kompetenz, die im Alltag wirklich ankommt.",
    text: "Praxisnahe Weiterbildungen für Unternehmen und Privatpersonen – von KI im Arbeitsalltag bis Smartphone, Social Media und digitaler Sicherheit.",
    cta: "Academy entdecken",
  },
  {
    id: "software",
    label: "Custom Software",
    meta: "Individuelle Systeme",
    title: "Software, die sich an echte Abläufe anpasst.",
    text: "Interne Tools, Dashboards und branchenspezifische Anwendungen, die Prozesse zusammenführen statt neue Umwege zu schaffen.",
    cta: "Software ansehen",
  },
  {
    id: "ki",
    label: "KI Beratung",
    meta: "Prozesse & Automatisierung",
    title: "KI dort einsetzen, wo sie wirklich Zeit spart.",
    text: "Wir analysieren wiederkehrende Aufgaben, wählen sinnvolle Tools und entwickeln klare Workflows für den täglichen Einsatz.",
    cta: "KI Beratung ansehen",
  },
  {
    id: "social",
    label: "Social Media",
    meta: "Strategie & Betreuung",
    title: "Social Media mit Struktur statt Einzelposts.",
    text: "Strategie, Content, Planung und Auswertung in einem durchgängigen System – passend zur Marke und zur Zielgruppe.",
    cta: "Social Media ansehen",
  },
  {
    id: "web",
    label: "Websites",
    meta: "Design & Entwicklung",
    title: "Websites, die hochwertig aussehen und klar funktionieren.",
    text: "Individuelles Design, schnelle Umsetzung und saubere Nutzerführung – vom ersten Eindruck bis zur Anfrage.",
    cta: "Websites ansehen",
  },
];

function CapabilityVisual({ id }) {
  if (id === "academy") {
    return (
      <div className="cap-visual academy-preview">
        <div className="academy-card academy-business">
          <span>Für Unternehmen</span>
          <b>KI im Arbeitsalltag</b>
          <p>Workshops für Teams, Führungskräfte und individuelle Unternehmensprozesse.</p>
          <div className="academy-tags">
            <i>ChatGPT</i><i>Automatisierung</i><i>KI Grundlagen</i>
          </div>
        </div>
        <div className="academy-card academy-private">
          <span>Für Privatpersonen</span>
          <b>Digital einfach verstehen</b>
          <p>KI, Smartphone, Social Media und digitale Sicherheit verständlich erklärt.</p>
          <div className="academy-tags">
            <i>KI & ChatGPT</i><i>Smartphone</i><i>Social Media</i>
          </div>
        </div>
      </div>
    );
  }

  if (id === "software") {
    return (
      <div className="cap-visual app-preview">
        <div className="app-preview-top"><b>HSM OS</b><span>Live</span></div>
        <div className="app-preview-body">
          <aside><i></i><i></i><i></i><i></i></aside>
          <div className="app-preview-main">
            <div className="app-metrics"><span><small>Projekte</small><b>12</b></span><span><small>Automationen</small><b>28</b></span></div>
            <div className="app-chart"><i></i></div>
            <div className="app-list"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "ki") {
    return (
      <div className="cap-visual workflow-preview">
        <div className="flow-node"><small>Eingang</small><b>E-Mail & Dokumente</b></div>
        <div className="flow-line"></div>
        <div className="flow-node focus"><small>Verarbeitung</small><b>KI Workflow</b></div>
        <div className="flow-line"></div>
        <div className="flow-node"><small>Ausgabe</small><b>Geprüft & bereit</b></div>
      </div>
    );
  }

  if (id === "social") {
    return (
      <div className="cap-visual social-preview">
        <div className="social-column">
          <small>Content Plan</small>
          <div className="social-post tall"></div>
          <div className="social-post"></div>
        </div>
        <div className="social-column shifted">
          <div className="social-post"></div>
          <div className="social-post tall"></div>
        </div>
        <div className="social-stats">
          <span><small>Reichweite</small><b>+34%</b></span>
          <span><small>Interaktion</small><b>8.4%</b></span>
        </div>
      </div>
    );
  }

  return (
    <div className="cap-visual web-preview">
      <div className="web-browser">
        <div className="web-browser-top"><i></i><i></i><i></i></div>
        <div className="web-browser-page">
          <small>HSM</small>
          <b>Built for the way<br/>you actually work.</b>
          <span></span>
        </div>
      </div>
      <div className="web-phone">
        <div></div><span></span><span></span>
      </div>
    </div>
  );
}

function CapabilitiesSection() {
  const [activeId, setActiveId] = useState("academy");
  const active = capabilityItems.find((item) => item.id === activeId) || capabilityItems[0];

  return (
    <section className="capabilities-section" id="services">
      <div className="capabilities-wrap">
        <div className="capabilities-heading">
          <span>HSM</span>
          <h2>Was wir machen.</h2>
          <p>Von Weiterbildung bis zur fertigen digitalen Lösung.</p>
        </div>

        <div className="capabilities-glass">
          <nav className="capability-nav" aria-label="HSM Leistungen">
            <div className="capability-nav-label">Leistungen</div>
            {capabilityItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={activeId === item.id ? "active" : ""}
                onClick={() => setActiveId(item.id)}
              >
                <span>{item.label}</span>
                <small>{item.meta}</small>
              </button>
            ))}
          </nav>

          <div className={"capability-content capability-" + active.id}>
            <div className="capability-copy">
              {active.id === "academy" && <span className="capability-featured">Hauptbereich</span>}
              <h3>{active.title}</h3>
              <p>{active.text}</p>
              <button className="capability-cta" type="button">{active.cta}</button>
            </div>
            <div className="capability-stage">
              <CapabilityVisual id={active.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function App() {
  return (
    <main>
      <HeroScrub />
      <CapabilitiesSection />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
