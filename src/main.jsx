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
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=90",
    position: "center",
  },
  {
    id: "software",
    label: "Custom Software",
    subtitle: "Individuelle Systeme für echte Abläufe",
    meta: "Software",
    href: "/software",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=90",
    position: "center",
  },
  {
    id: "social",
    label: "Social Media",
    subtitle: "Content, Strategie & Betreuung",
    meta: "Social",
    href: "/social-media",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=90",
    position: "center",
  },
  {
    id: "web",
    label: "Websites",
    subtitle: "Design, Entwicklung & digitale Präsenz",
    meta: "Web",
    href: "/websites",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=90",
    position: "center",
  },
];

function CapabilitiesSection() {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let raf = 0;

    function updateActive() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let bestIndex = 0;
        let bestDistance = Infinity;

        Array.from(track.querySelectorAll(".image-service-card")).forEach((card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(cardCenter - center);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        });

        setActiveIndex(bestIndex);
      });
    }

    function wheelToHorizontal(event) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const max = track.scrollWidth - track.clientWidth;
      const canMoveForward = event.deltaY > 0 && track.scrollLeft < max - 2;
      const canMoveBack = event.deltaY < 0 && track.scrollLeft > 2;

      if (!canMoveForward && !canMoveBack) return;

      event.preventDefault();
      track.scrollBy({
        left: event.deltaY * 1.35,
        behavior: "smooth",
      });
    }

    track.addEventListener("scroll", updateActive, { passive: true });
    track.addEventListener("wheel", wheelToHorizontal, { passive: false });
    updateActive();

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", updateActive);
      track.removeEventListener("wheel", wheelToHorizontal);
    };
  }, []);

  function focusCard(index) {
    const track = trackRef.current;
    const card = track?.querySelectorAll(".image-service-card")[index];
    if (!track || !card) return;

    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  }

  return (
    <section className="capabilities-section" id="services">
      <div className="capabilities-heading">
        <span>HSM</span>
        <h2>Was wir machen</h2>
        <p>Vier Bereiche. Ein digitaler Partner.</p>
      </div>

      <div className="service-carousel-shell">
        <div className="service-carousel-glow glow-left"></div>
        <div className="service-carousel-glow glow-right"></div>

        <div className="service-image-track" ref={trackRef}>
          <div className="service-track-spacer" aria-hidden="true"></div>

          {serviceCards.map((item, index) => (
            <a
              className={"image-service-card " + (activeIndex === index ? "is-active" : "")}
              href={item.href}
              key={item.id}
              onMouseEnter={() => focusCard(index)}
              aria-label={item.label + ": " + item.subtitle}
            >
              <img
                src={item.image}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                style={{ objectPosition: item.position }}
              />

              <div className="service-image-shade"></div>

              <div className="service-image-meta">
                <span>{item.meta}</span>
              </div>

              <div className="service-image-glass">
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.subtitle}</p>
                </div>
                <span className="service-image-open" aria-hidden="true">→</span>
              </div>
            </a>
          ))}

          <div className="service-track-spacer" aria-hidden="true"></div>
        </div>

        <div className="service-carousel-dots" aria-hidden="true">
          {serviceCards.map((item, index) => (
            <button
              key={item.id}
              className={activeIndex === index ? "active" : ""}
              type="button"
              onClick={() => focusCard(index)}
              tabIndex="-1"
            ></button>
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
