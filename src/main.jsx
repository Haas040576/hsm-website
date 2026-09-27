import React, { useEffect, useRef } from "react";
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
    title: "Digitale Kompetenz für Unternehmen und Menschen.",
    text: "KI-Weiterbildungen für Teams sowie verständliche Kurse zu KI, Smartphone und Social Media für Privatpersonen.",
    className: "service-glass-card service-glass-card-academy",
  },
  {
    id: "software",
    label: "Custom Software",
    title: "Systeme, die sich an echte Abläufe anpassen.",
    text: "Interne Tools, Dashboards und individuelle Software für konkrete Prozesse.",
    className: "service-glass-card",
  },
  {
    id: "ki",
    label: "KI Beratung",
    title: "KI sinnvoll in den Arbeitsalltag bringen.",
    text: "Prozesse verstehen, Potenziale erkennen und saubere Workflows aufbauen.",
    className: "service-glass-card",
  },
  {
    id: "social",
    label: "Social Media",
    title: "Content und Betreuung mit einem klaren System.",
    text: "Strategie, Produktion, Planung und Auswertung für moderne Marken.",
    className: "service-glass-card",
  },
  {
    id: "web",
    label: "Websites",
    title: "Digitale Auftritte, die hochwertig wirken und funktionieren.",
    text: "Individuelles Webdesign mit klarer Nutzerführung und sauberer Entwicklung.",
    className: "service-glass-card",
  },
];

function ServiceCardArt({ id }) {
  if (id === "academy") {
    return (
      <div className="gallery-art gallery-art-academy" aria-hidden="true">
        <div className="academy-screen">
          <div className="academy-screen-top"><span>HSM Academy</span><i>Workshop</i></div>
          <div className="academy-screen-copy">
            <small>Für Unternehmen</small>
            <b>KI im Arbeitsalltag</b>
            <div className="academy-module-row">
              <span>ChatGPT</span><span>Automatisierung</span><span>Praxis</span>
            </div>
          </div>
        </div>
        <div className="academy-mini-card academy-mini-card-dark">
          <small>Privat</small>
          <b>Digital einfach verstehen</b>
        </div>
        <div className="academy-mini-card academy-mini-card-light">
          <small>Kurs</small>
          <b>Smartphone & Social Media</b>
        </div>
      </div>
    );
  }

  if (id === "software") {
    return (
      <div className="gallery-art gallery-art-software" aria-hidden="true">
        <div className="software-window">
          <div className="software-window-top"><span>HSM OS</span><i>Live</i></div>
          <div className="software-layout">
            <aside><i></i><i></i><i></i></aside>
            <div>
              <div className="software-metrics"><span></span><span></span></div>
              <div className="software-graph"><i></i></div>
              <div className="software-lines"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === "ki") {
    return (
      <div className="gallery-art gallery-art-ai" aria-hidden="true">
        <div className="ai-orbit"></div>
        <div className="ai-core"><span>HSM</span><b>KI</b></div>
        <div className="ai-chip ai-chip-one">Analyse</div>
        <div className="ai-chip ai-chip-two">Workflow</div>
        <div className="ai-chip ai-chip-three">Automatisierung</div>
      </div>
    );
  }

  if (id === "social") {
    return (
      <div className="gallery-art gallery-art-social" aria-hidden="true">
        <div className="social-phone social-phone-back">
          <span></span><span></span>
        </div>
        <div className="social-phone social-phone-front">
          <div className="social-phone-head"></div>
          <div className="social-feed-card"></div>
          <div className="social-feed-lines"><i></i><i></i></div>
        </div>
        <div className="social-float-stat"><small>Reichweite</small><b>+34%</b></div>
      </div>
    );
  }

  return (
    <div className="gallery-art gallery-art-web" aria-hidden="true">
      <div className="web-gallery-browser">
        <div className="web-gallery-bar"><i></i><i></i><i></i></div>
        <div className="web-gallery-page">
          <span>HSM</span>
          <b>Built for<br/>the way you work.</b>
          <i></i>
        </div>
      </div>
      <div className="web-gallery-mobile"><i></i><span></span><span></span></div>
    </div>
  );
}

function CapabilitiesSection() {
  return (
    <section className="capabilities-section" id="services">
      <div className="capabilities-wrap">
        <div className="capabilities-heading">
          <span>HSM</span>
          <h2>Was wir machen.</h2>
          <p>Weiterbildung, Systeme und digitale Lösungen aus einer Hand.</p>
        </div>

        <div className="service-gallery">
          {serviceCards.map((item) => (
            <article className={item.className} key={item.id}>
              <div className="service-card-art-wrap">
                <ServiceCardArt id={item.id} />
              </div>
              <div className="service-card-copy">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button type="button">Mehr erfahren</button>
              </div>
            </article>
          ))}
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
