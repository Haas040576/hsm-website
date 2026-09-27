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
    image: "https://images.unsplash.com/photo-1769839271768-aee5469799ee?auto=format&fit=crop&w=1600&q=90",
    position: "center 34%",
  },
  {
    id: "software",
    label: "Custom Software",
    subtitle: "Individuelle Systeme für echte Abläufe",
    meta: "Software",
    href: "/software",
    image: "https://images.unsplash.com/photo-1753715613434-9c7cb58876b9?auto=format&fit=crop&w=1600&q=90",
    position: "center",
  },
  {
    id: "social",
    label: "Social Media",
    subtitle: "Content, Strategie & Betreuung",
    meta: "Social",
    href: "/social-media",
    image: "https://images.unsplash.com/photo-1781606424661-de1dc2b4c6e1?auto=format&fit=crop&w=1600&q=90",
    position: "center",
  },
  {
    id: "web",
    label: "Websites",
    subtitle: "Design, Entwicklung & digitale Präsenz",
    meta: "Web",
    href: "/websites",
    image: "https://images.unsplash.com/photo-1727527606000-8bee0d891207?auto=format&fit=crop&w=1600&q=90",
    position: "center",
  },
];

function CapabilitiesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLockRef = useRef(false);
  const pointerRef = useRef({ down: false, startX: 0, lastX: 0, moved: false });

  function move(direction) {
    setActiveIndex((current) => {
      const count = serviceCards.length;
      return (current + direction + count) % count;
    });
  }

  function circularOffset(index) {
    const count = serviceCards.length;
    let offset = index - activeIndex;

    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;

    if (count % 2 === 0 && offset === count / 2) {
      offset = activeIndex % 2 === 0 ? count / 2 : -count / 2;
    }

    return offset;
  }

  function handleWheel(event) {
    const primary = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(primary) < 18 || wheelLockRef.current) return;

    event.preventDefault();
    wheelLockRef.current = true;
    move(primary > 0 ? 1 : -1);

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 440);
  }

  function handlePointerDown(event) {
    pointerRef.current = {
      down: true,
      startX: event.clientX,
      lastX: event.clientX,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!pointerRef.current.down) return;

    pointerRef.current.lastX = event.clientX;
    if (Math.abs(event.clientX - pointerRef.current.startX) > 8) {
      pointerRef.current.moved = true;
    }
  }

  function handlePointerUp(event) {
    if (!pointerRef.current.down) return;

    const delta = pointerRef.current.lastX - pointerRef.current.startX;
    pointerRef.current.down = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (Math.abs(delta) > 48) {
      move(delta < 0 ? 1 : -1);
    }
  }

  function handleCardClick(event, index) {
    if (pointerRef.current.moved) {
      event.preventDefault();
      pointerRef.current.moved = false;
      return;
    }

    if (index !== activeIndex) {
      event.preventDefault();
      setActiveIndex(index);
    }
  }

  return (
    <section className="capabilities-section" id="services">
      <div className="capabilities-heading">
        <span>HSM</span>
        <h2>Was wir machen</h2>
        <p>Vier Bereiche. Ein digitaler Partner.</p>
      </div>

      <div
        className="service-3d-carousel"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="service-3d-stage">
          {serviceCards.map((item, index) => {
            const offset = circularOffset(index);
            const absOffset = Math.abs(offset);

            return (
              <a
                className={"image-service-card " + (index === activeIndex ? "is-active" : "")}
                href={item.href}
                key={item.id}
                onClick={(event) => handleCardClick(event, index)}
                style={{
                  "--card-offset": offset,
                  "--card-abs": absOffset,
                  "--card-z": 20 - absOffset,
                }}
                aria-label={item.label + ": " + item.subtitle}
              >
                <img
                  src={item.image}
                  alt=""
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable="false"
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
            );
          })}
        </div>

        <div className="service-carousel-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Vorherige Leistung">←</button>
          <div className="service-carousel-dots" aria-hidden="true">
            {serviceCards.map((item, index) => (
              <button
                key={item.id}
                className={activeIndex === index ? "active" : ""}
                type="button"
                onClick={() => setActiveIndex(index)}
                tabIndex="-1"
              ></button>
            ))}
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Nächste Leistung">→</button>
        </div>
      </div>
    </section>
  );
}

function ServiceDestination({ item }) {
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
