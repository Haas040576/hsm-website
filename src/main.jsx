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
    title: "KI verstehen. Digital sicher werden. Direkt anwenden.",
    text: "KI-Seminare für Unternehmen, individuelle KI-Beratung und verständliche Kurse für Privatpersonen.",
    href: "/academy",
    featured: true,
  },
  {
    id: "software",
    label: "Custom Software",
    title: "Software, die genau zu deinem Unternehmen passt.",
    text: "Interne Systeme, Dashboards und individuelle Anwendungen für echte Abläufe.",
    href: "/solutions",
  },
  {
    id: "social",
    label: "Social Media",
    title: "Content, der zur Marke passt und konstant funktioniert.",
    text: "Strategie, Produktion, Planung und Betreuung aus einem System.",
    href: "/solutions",
  },
  {
    id: "web",
    label: "Websites",
    title: "Digitale Auftritte, die hochwertig wirken und klar führen.",
    text: "Individuelles Design, schnelle Entwicklung und saubere Nutzerführung.",
    href: "/solutions",
  },
];

function ServiceCardArt({ id }) {
  if (id === "academy") {
    return (
      <div className="academy-visual" aria-hidden="true">
        <div className="academy-scene-glow"></div>

        <div className="academy-main-window">
          <div className="app-window-bar">
            <span>HSM Academy</span>
            <div><i></i><i></i><i></i></div>
          </div>
          <div className="academy-window-body">
            <small>Für Unternehmen</small>
            <b>KI im Arbeitsalltag</b>
            <p>Verstehen, anwenden und sinnvoll in bestehende Prozesse integrieren.</p>
            <div className="academy-pills">
              <span>KI Seminare</span>
              <span>KI Beratung</span>
              <span>Workshops</span>
            </div>
          </div>
        </div>

        <div className="academy-floating academy-floating-business">
          <small>Unternehmen</small>
          <b>Teams weiterbilden</b>
          <span>Praxisnah vor Ort oder remote</span>
        </div>

        <div className="academy-floating academy-floating-private">
          <small>Privat</small>
          <b>Digital einfach verstehen</b>
          <span>KI, Smartphone und Social Media</span>
        </div>

        <div className="academy-floating academy-floating-advice">
          <small>KI Beratung</small>
          <b>Potenziale erkennen</b>
        </div>

        <span className="ai-disclosure">KI-generierte Visualisierung</span>
      </div>
    );
  }

  if (id === "software") {
    return (
      <div className="service-app-visual software-visual" aria-hidden="true">
        <div className="service-app-window">
          <div className="app-window-bar">
            <span>HSM OS</span>
            <div><i></i><i></i><i></i></div>
          </div>
          <div className="software-app-body">
            <aside><i></i><i></i><i></i><i></i></aside>
            <div className="software-app-main">
              <div className="software-app-kpis">
                <span><small>Projekte</small><b>12</b></span>
                <span><small>Automationen</small><b>28</b></span>
              </div>
              <div className="software-app-chart"><i></i></div>
              <div className="software-app-row"><i></i><span></span><b></b></div>
              <div className="software-app-row"><i></i><span></span><b></b></div>
            </div>
          </div>
        </div>
        <div className="software-glass-stat"><small>Heute</small><b>8 Abläufe automatisch</b></div>
      </div>
    );
  }

  if (id === "social") {
    return (
      <div className="service-app-visual social-visual" aria-hidden="true">
        <div className="social-device social-device-back">
          <div className="social-content-block"></div>
          <span></span><span></span>
        </div>
        <div className="social-device social-device-front">
          <div className="social-island"></div>
          <div className="social-content-block main"></div>
          <div className="social-ui-line"></div>
          <div className="social-ui-line short"></div>
        </div>
        <div className="social-glass-metric metric-a"><small>Reichweite</small><b>+34%</b></div>
        <div className="social-glass-metric metric-b"><small>Content Plan</small><b>12 Posts</b></div>
      </div>
    );
  }

  return (
    <div className="service-app-visual web-visual" aria-hidden="true">
      <div className="web-app-browser">
        <div className="app-window-bar">
          <span>haas-saida-media.de</span>
          <div><i></i><i></i><i></i></div>
        </div>
        <div className="web-app-page">
          <small>HSM</small>
          <b>Built for the way<br/>you actually work.</b>
          <span className="web-app-button"></span>
          <div className="web-app-glass"></div>
        </div>
      </div>
      <div className="web-app-phone"><i></i><span></span><span></span></div>
    </div>
  );
}

function CapabilitiesSection() {
  return (
    <section className="capabilities-section" id="services">
      <div className="capabilities-wrap">
        <header className="capabilities-heading">
          <span className="capabilities-kicker">HSM</span>
          <h2>Was wir machen</h2>
          <p>Weiterbildung, Software und digitale Präsenz. Klar aufgebaut und direkt nutzbar.</p>
        </header>

        <div className="service-gallery">
          {serviceCards.map((item) => (
            <article
              className={"service-glass-card " + (item.featured ? "service-glass-card-academy" : "")}
              key={item.id}
            >
              <div className="service-card-visual-wrap">
                <ServiceCardArt id={item.id} />
              </div>

              <div className="service-card-copy">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                {item.id === "academy" && (
                  <div className="academy-direct-links">
                    <a href="/academy/unternehmen">KI für Unternehmen</a>
                    <a href="/academy/privat">Kurse für Privatpersonen</a>
                  </div>
                )}

                <a className="service-card-link" href={item.href}>Mehr erfahren</a>
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
