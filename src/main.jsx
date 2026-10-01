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

    function restoreFrame() {
      if (document.hidden || !clip || !duration) return;

      ready = true;
      seekAt = seekTo;

      try {
        clip.pause();
        clip.currentTime = seekTo;
      } catch (e) {}

      var playPromise;
      try { playPromise = clip.play(); } catch (e) {}

      if (playPromise && playPromise.then) {
        playPromise
          .then(function() {
            clip.pause();
            try { clip.currentTime = seekTo; } catch (e) {}
          })
          .catch(function() {
            try { clip.currentTime = seekTo; } catch (e) {}
          });
      }
    }

    function handleVisibility() {
      if (!document.hidden) {
        window.requestAnimationFrame(restoreFrame);
      }
    }

    function handlePageShow() {
      window.requestAnimationFrame(restoreFrame);
    }

    window.addEventListener("wheel", onWheel, { passive:false });
    window.addEventListener("resize", readScroll);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);

    readScroll();
    paint();
    preload();
    raf = requestAnimationFrame(frame);

    return function() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", readScroll);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
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

const serviceThickness = [-1.5, -0.75, 0, 0.75, 1.5];

function ServiceCylinderCard({ item, cardRef }) {
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
              style={{ transform: "translateZ(" + depth + "px) rotateX(180deg)" }}
              aria-hidden="true"
            >
              <img src={item.image} alt="" draggable="false" style={{ objectPosition: item.position }} />
              <span className="cylinder-card-back-blur"></span>
              <span className="cylinder-card-back-brand">HSM</span>
              <span className="cylinder-card-back-copy">
                <small>{item.meta}</small>
                <b>{item.label}</b>
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
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cardsRefs = useRef([]);
  const frameRef = useRef(0);
  const currentProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const metricsRef = useRef({ cardW: 300, cardH: 188 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return undefined;

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function smoothstep(t) {
      return t * t * (3 - 2 * t);
    }

    function updateMetrics() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      let cardW = Math.round(w * 0.115 + 120);
      const heightFactor = Math.min(1, Math.max(0.8, h / 900));
      cardW = Math.round(cardW * heightFactor);
      cardW = Math.min(300, Math.max(215, cardW));

      const cardH = Math.round(cardW / 1.5925);
      metricsRef.current = { cardW, cardH };

      cardsRefs.current.forEach((card) => {
        if (!card) return;
        card.style.width = cardW + "px";
        card.style.height = cardH + "px";
        card.style.marginLeft = -(cardW / 2) + "px";
        card.style.marginTop = -(cardH / 2) + "px";
      });

      updateScrollProgress();
    }

    function updateScrollProgress() {
      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;
      const scrollRange = Math.max(
        1,
        section.offsetHeight - window.innerHeight
      );

      const raw = (window.scrollY - sectionTop) / scrollRange;
      targetProgressRef.current =
        clamp(raw, 0, 1) * (serviceCards.length - 1);
    }

    function handleMouseMove(event) {
      const rect = stage.getBoundingClientRect();
      const rx =
        (event.clientX - (rect.left + rect.width / 2)) /
        Math.max(1, rect.width / 2);
      const ry =
        (event.clientY - (rect.top + rect.height / 2)) /
        Math.max(1, rect.height / 2);

      mouseRef.current.targetX = clamp(rx, -1, 1);
      mouseRef.current.targetY = clamp(ry, -1, 1);
    }

    function handleMouseLeave() {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    }

    function renderLoop() {
      const cards = cardsRefs.current;
      const { cardH } = metricsRef.current;
      const h = stage.clientHeight || 460;

      currentProgressRef.current +=
        (targetProgressRef.current - currentProgressRef.current) * 0.115;

      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const progress = currentProgressRef.current;

      for (let i = 0; i < serviceCards.length; i += 1) {
        const card = cards[i];
        if (!card) continue;

        const offset = i - progress;
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset) || 1;

        if (absOffset > 1.72) {
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
          card.style.visibility = "hidden";
          continue;
        }

        card.style.visibility = "visible";

        const firstT = Math.min(absOffset, 1);
        const easedFirst = smoothstep(firstT);

        const firstY = cardH + 26;
        let y = sign * easedFirst * firstY;
        let z = 360 + easedFirst * (215 - 360);
        let rotX = sign * easedFirst * 82;

        if (absOffset > 1) {
          const t = smoothstep((absOffset - 1) / 0.72);
          const edgeY = Math.max(firstY + 64, h * 0.43);

          y = sign * (firstY + t * (edgeY - firstY));
          z = 215 + t * (-70 - 215);
          rotX = sign * (82 + t * 36);
        }

        const centerFactor = Math.max(0, 1 - absOffset);
        const tiltX = -mouseRef.current.y * 6 * centerFactor;
        const tiltY = mouseRef.current.x * 8 * centerFactor;

        const fade =
          absOffset <= 1
            ? 1
            : 1 - smoothstep((absOffset - 1) / 0.72);

        card.style.zIndex = String(Math.round(z + 500));
        card.style.opacity = String(clamp(fade, 0, 1));
        card.style.pointerEvents = absOffset < 0.38 ? "auto" : "none";

        card.style.transform =
          "translateY(" + y.toFixed(2) + "px) " +
          "translateZ(" + z.toFixed(2) + "px) " +
          "rotateX(" + (rotX + tiltX).toFixed(2) + "deg) " +
          "rotateY(" + tiltY.toFixed(2) + "deg) " +
          "rotateZ(-1.5deg)";
      }

      frameRef.current = requestAnimationFrame(renderLoop);
    }

    updateMetrics();
    updateScrollProgress();

    window.addEventListener("resize", updateMetrics);
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    stage.addEventListener("mousemove", handleMouseMove);
    stage.addEventListener("mouseleave", handleMouseLeave);

    frameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("scroll", updateScrollProgress);
      stage.removeEventListener("mousemove", handleMouseMove);
      stage.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="capabilities-section" id="services" ref={sectionRef}>
      <div className="capabilities-sticky">
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
                  key={item.id}
                  cardRef={(el) => { cardsRefs.current[index] = el; }}
                />
              ))}
            </div>
          </div>

          <p className="cylinder-carousel-hint">Scrollen zum Wechseln</p>
        </div>
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

const academyModules = [
  {
    key: "mitarbeiter",
    eyebrow: "KI-Schulung für Mitarbeiter",
    title: "KI im Arbeitsalltag sicher einsetzen.",
    text: "Grundlagen, gute Prompts und konkrete Aufgaben aus dem Unternehmen. Geeignet für Teams, die ChatGPT und andere KI-Tools strukturiert nutzen sollen.",
    tags: ["KI Schulung Unternehmen", "KI Schulung Mitarbeiter", "KI Weiterbildung"],
  },
  {
    key: "chatgpt",
    eyebrow: "ChatGPT Schulung",
    title: "ChatGPT und Copilot praktisch nutzen.",
    text: "Texte, Recherche, Zusammenfassungen, Vorbereitung und wiederkehrende Aufgaben. Direkt am eigenen Arbeitsalltag statt an allgemeinen Beispielen.",
    tags: ["ChatGPT Schulung", "Microsoft Copilot Schulung", "Prompting"],
  },
  {
    key: "kompetenz",
    eyebrow: "KI-Kompetenz & EU AI Act",
    title: "Regeln verstehen. KI verantwortungsvoll nutzen.",
    text: "Sichere Nutzung, interne Leitlinien, sensible Daten und KI-Kompetenz nach Artikel 4 des EU AI Act werden verständlich in den Arbeitskontext eingeordnet.",
    tags: ["EU AI Act Schulung", "KI Kompetenz", "KI Weiterbildung Unternehmen"],
  },
  {
    key: "beratung",
    eyebrow: "KI Beratung für Unternehmen",
    title: "Prozesse prüfen und sinnvolle KI-Anwendungen finden.",
    text: "Wir schauen auf bestehende Abläufe und priorisieren Einsatzmöglichkeiten, bei denen KI oder Automatisierung tatsächlich Arbeit abnimmt.",
    tags: ["KI Beratung München", "KI Automatisierung", "Prozessanalyse"],
  },
];

const academyFaqs = [
  {
    q: "Für welche Unternehmen ist eine KI-Schulung geeignet?",
    a: "Für kleine und mittlere Unternehmen ebenso wie für einzelne Teams. Inhalte, Beispiele und Übungen können an Abteilung, Vorkenntnisse und typische Aufgaben angepasst werden.",
  },
  {
    q: "Gibt es KI-Schulungen vor Ort in München?",
    a: "Ja. HSM Academy bietet KI-Schulungen und Workshops vor Ort in München und Oberbayern sowie remote an.",
  },
  {
    q: "Was ist Inhalt einer ChatGPT Schulung?",
    a: "Je nach Bedarf geht es um Grundlagen, Prompting, Recherche, Textarbeit, Zusammenfassungen, sichere Nutzung und konkrete Aufgaben aus dem Arbeitsalltag.",
  },
  {
    q: "Kann eine Schulung beim Thema EU AI Act und KI-Kompetenz helfen?",
    a: "Eine Schulung kann ein Baustein sein, um KI-Kompetenz im Unternehmen aufzubauen. Inhalte können sichere Nutzung, Verantwortlichkeiten und den praktischen Umgang mit KI-Systemen abdecken.",
  },
];

function AcademyPage() {
  const [activeModule, setActiveModule] = useState(0);
  const [planAudience, setPlanAudience] = useState("Unternehmen");
  const [planTopic, setPlanTopic] = useState("KI-Schulung");
  const [planFormat, setPlanFormat] = useState("Vor Ort");
  const pageRef = useRef(null);
  const progressRef = useRef(null);
  const heroVisualRef = useRef(null);

  usePageMeta({
    title: "KI-Schulung München für Unternehmen | HSM Academy",
    description: "KI-Schulungen für Unternehmen in München und Oberbayern: ChatGPT Schulung, KI Weiterbildung für Mitarbeiter, EU AI Act KI-Kompetenz und KI Beratung.",
    path: "/academy",
  });

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const revealItems = Array.from(root.querySelectorAll("[data-academy-reveal]"));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => revealObserver.observe(item));

    const moduleItems = Array.from(root.querySelectorAll("[data-academy-module]"));
    const moduleObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveModule(Number(visible.target.dataset.academyModule || 0));
      }
    }, {
      threshold: [0.3, 0.55, 0.75],
      rootMargin: "-18% 0px -28% 0px",
    });

    moduleItems.forEach((item) => moduleObserver.observe(item));

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / max));

        if (progressRef.current) {
          progressRef.current.style.transform = "scaleX(" + progress + ")";
        }

        if (heroVisualRef.current) {
          const heroRect = heroVisualRef.current.getBoundingClientRect();
          const heroProgress = Math.min(1, Math.max(0, -heroRect.top / Math.max(1, heroRect.height)));
          heroVisualRef.current.style.setProperty("--academy-hero-scroll", heroProgress.toFixed(3));
        }

        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      revealObserver.disconnect();
      moduleObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const plannerHref =
    "mailto:kontakt@haas-saida-media.de?subject=" +
    encodeURIComponent("HSM Academy – " + planTopic) +
    "&body=" +
    encodeURIComponent(
      "Bereich: " + planAudience + "\nThema: " + planTopic + "\nFormat: " + planFormat + "\n\nBitte um Informationen zu einem passenden Termin."
    );

  return (
    <main className="academy-page academy-page-v2" ref={pageRef}>
      <div className="academy-scroll-progress"><i ref={progressRef}></i></div>

      <nav className="academy-nav academy-nav-v2">
        <a className="academy-nav-logo" href="/">HSM</a>
        <div className="academy-nav-links">
          <a href="#schulungen">Schulungen</a>
          <a href="#privat">Privat</a>
          <a href="#planen">Seminar planen</a>
        </div>
        <a className="academy-nav-cta" href="#planen">Anfragen</a>
      </nav>

      <section className="academy-v2-hero">
        <div className="academy-v2-hero-copy" data-academy-reveal>
          <span className="academy-page-kicker">HSM Academy</span>
          <h1>KI-Schulungen für Unternehmen in München.</h1>
          <p>ChatGPT Schulung, KI Weiterbildung für Mitarbeiter und KI Beratung – vor Ort in München und Oberbayern oder remote.</p>

          <div className="academy-v2-actions">
            <a href="#schulungen">Schulungen ansehen</a>
            <a className="secondary" href="#planen">Seminar anfragen</a>
          </div>

          <div className="academy-v2-keywords">
            <span>KI Schulung Unternehmen</span>
            <span>ChatGPT Schulung</span>
            <span>KI Beratung München</span>
          </div>
        </div>

        <div className="academy-v2-visual" ref={heroVisualRef} data-academy-reveal>
          <img
            src="https://images.unsplash.com/photo-1769839271768-aee5469799ee?auto=format&fit=crop&w=1900&q=92"
            alt="Business-Seminar mit Dozent vor einer Gruppe"
          />
          <div className="academy-v2-visual-shade"></div>

          <div className="academy-v2-float float-one">
            <small>Inhouse</small>
            <b>KI-Schulung für Teams</b>
          </div>
          <div className="academy-v2-float float-two">
            <small>Praxis</small>
            <b>ChatGPT & Copilot</b>
          </div>
          <div className="academy-v2-float float-three">
            <small>KI-Kompetenz</small>
            <b>EU AI Act</b>
          </div>
        </div>
      </section>

      <section className="academy-v2-intro" data-academy-reveal>
        <span>Für Unternehmen</span>
        <h2>KI verstehen. Im Arbeitsalltag anwenden.</h2>
        <p>Die Inhalte werden an Team, Branche und konkrete Aufgaben angepasst. Der Schwerpunkt liegt auf Anwendungen, die Mitarbeitende direkt nutzen können.</p>
      </section>

      <section className="academy-v2-story" id="schulungen">
        <div className="academy-v2-story-sticky">
          <div className="academy-v2-story-card">
            <div className="academy-v2-story-top">
              <span>HSM Academy</span>
              <i>{String(activeModule + 1).padStart(2, "0")} / {String(academyModules.length).padStart(2, "0")}</i>
            </div>

            <div className="academy-v2-story-visual">
              <div className={"academy-v2-orb module-" + academyModules[activeModule].key}></div>
              <div className="academy-v2-story-window">
                <small>{academyModules[activeModule].eyebrow}</small>
                <b>{academyModules[activeModule].title}</b>
                <div className="academy-v2-story-lines"><i></i><i></i><i></i></div>
              </div>
            </div>

            <div className="academy-v2-story-tags">
              {academyModules[activeModule].tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        </div>

        <div className="academy-v2-story-steps">
          {academyModules.map((module, index) => (
            <article
              className={"academy-v2-step " + (activeModule === index ? "is-active" : "")}
              key={module.key}
              data-academy-module={index}
              data-academy-reveal
            >
              <span>{module.eyebrow}</span>
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="academy-v2-private" id="privat">
        <div className="academy-v2-private-visual" data-academy-reveal>
          <div className="academy-v2-device">
            <i></i>
            <span>KI & ChatGPT</span>
            <span>Smartphone</span>
            <span>Social Media</span>
          </div>
          <div className="academy-v2-private-chip chip-a">KI Kurs für Anfänger</div>
          <div className="academy-v2-private-chip chip-b">Smartphone Kurs</div>
        </div>

        <div className="academy-v2-private-copy" data-academy-reveal>
          <span>Für Privatpersonen</span>
          <h2>KI, Smartphone und Social Media verständlich erklärt.</h2>
          <p>Kurse für Einsteiger und ältere Menschen. Schritt für Schritt, ohne Fachbegriffe und mit Zeit für individuelle Fragen.</p>
          <div className="academy-v2-private-list">
            <span>KI Kurs & ChatGPT</span>
            <span>Smartphone Kurs</span>
            <span>Social Media Kurs</span>
            <span>Digitale Sicherheit</span>
          </div>
          <a href="#planen">Privaten Kurs anfragen</a>
        </div>
      </section>

      <section className="academy-v2-planner" id="planen" data-academy-reveal>
        <div className="academy-v2-planner-head">
          <span>Seminar planen</span>
          <h2>In drei Schritten zur passenden Schulung.</h2>
        </div>

        <div className="academy-v2-planner-grid">
          <div className="academy-v2-planner-controls">
            <div className="academy-v2-choice">
              <small>Bereich</small>
              <div>
                {["Unternehmen", "Privat"].map((value) => (
                  <button
                    type="button"
                    className={planAudience === value ? "active" : ""}
                    onClick={() => setPlanAudience(value)}
                    key={value}
                  >{value}</button>
                ))}
              </div>
            </div>

            <div className="academy-v2-choice">
              <small>Thema</small>
              <div>
                {(planAudience === "Unternehmen"
                  ? ["KI-Schulung", "ChatGPT Schulung", "EU AI Act", "KI Beratung"]
                  : ["KI & ChatGPT", "Smartphone", "Social Media", "Digitale Sicherheit"]
                ).map((value) => (
                  <button
                    type="button"
                    className={planTopic === value ? "active" : ""}
                    onClick={() => setPlanTopic(value)}
                    key={value}
                  >{value}</button>
                ))}
              </div>
            </div>

            <div className="academy-v2-choice">
              <small>Format</small>
              <div>
                {["Vor Ort", "Remote", "Individuell"].map((value) => (
                  <button
                    type="button"
                    className={planFormat === value ? "active" : ""}
                    onClick={() => setPlanFormat(value)}
                    key={value}
                  >{value}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="academy-v2-summary">
            <span>HSM Academy</span>
            <small>{planAudience}</small>
            <h3>{planTopic}</h3>
            <p>{planFormat}</p>
            <a href={plannerHref}>Anfrage vorbereiten</a>
          </div>
        </div>
      </section>

      <section className="academy-v2-faq" id="faq">
        <div className="academy-v2-faq-head" data-academy-reveal>
          <span>FAQ</span>
          <h2>Fragen zu KI-Schulung und Weiterbildung.</h2>
        </div>

        <div className="academy-v2-faq-list" data-academy-reveal>
          {academyFaqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}<span>+</span></summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="academy-v2-final" data-academy-reveal>
        <div>
          <span>HSM Academy</span>
          <h2>KI-Schulung passend zu deinem Unternehmen.</h2>
          <p>Vor Ort in München und Oberbayern oder remote.</p>
          <a href="#planen">Seminar planen</a>
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
