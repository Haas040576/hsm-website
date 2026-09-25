import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const services = [
  {
    id: "software",
    label: "Custom Softwares",
    text: "Individuelle Softwarelösungen, exakt auf Abläufe, Teams und Branchen zugeschnitten.",
    bullets: ["Interne Systeme", "Automatisierungen", "Dashboards", "Skalierbare Lösungen"],
    accent: "mint",
    icon: "code",
  },
  {
    id: "social",
    label: "Social Media Betreuung",
    text: "Strategische Betreuung, Content und Kampagnen für einen professionellen digitalen Auftritt.",
    bullets: ["Content Strategie", "Content Erstellung", "Kampagnen", "Performance Auswertung"],
    accent: "rose",
    icon: "camera",
  },
  {
    id: "ki",
    label: "KI Beratung",
    text: "Wir identifizieren repetitive Aufgaben und entwickeln sinnvolle KI-gestützte Abläufe.",
    bullets: ["Prozesse analysieren", "KI-Tools auswählen", "Workflows automatisieren", "Mitarbeiter einbinden"],
    accent: "violet",
    icon: "spark",
  },
  {
    id: "websites",
    label: "Websites",
    text: "Moderne, schnelle Websites mit hochwertigem Design und klarer Nutzerführung.",
    bullets: ["Individuelles Design", "Responsive Umsetzung", "SEO Grundlagen", "Wartung & Support"],
    accent: "blue",
    icon: "screen",
  },
];

const projects = [
  {
    title: "Das Charlie’s",
    category: "Restaurant Software",
    text: "Warenwirtschaft, Bestellvorschläge, Lieferantenübersicht und KI-gestützte Bedarfsprognosen in einem System.",
    kind: "dashboard",
  },
  {
    title: "Fahrschulsoftware",
    category: "Custom Software",
    text: "Digitale Verwaltung für Fahrschulen.",
    kind: "school",
  },
  {
    title: "Gastro Tap",
    category: "NFC System",
    text: "Digitale Touchpoints für Restaurants.",
    kind: "nfc",
  },
  {
    title: "HSM Campaigns",
    category: "Campaign Platform",
    text: "Kampagnen- und Creator-Management.",
    kind: "campaign",
  },
];

function Icon({ type }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "code") return <svg {...common}><path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m14 5-4 14"/></svg>;
  if (type === "camera") return <svg {...common}><path d="M4 8h16v11H4z"/><path d="m8 8 1.2-3h5.6L16 8"/><circle cx="12" cy="13.5" r="3.2"/></svg>;
  if (type === "spark") return <svg {...common}><path d="M12 3 10.4 8.4 5 10l5.4 1.6L12 17l1.6-5.4L19 10l-5.4-1.6L12 3Z"/><path d="M5 16.5 4.3 19 2 19.7 4.3 20.4 5 23l.7-2.6L8 19.7 5.7 19 5 16.5Z"/></svg>;
  return <svg {...common}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
}

function Arrow() {
  return <span aria-hidden="true">→</span>;
}

function MiniChart() {
  return (
    <svg className="chart" viewBox="0 0 420 150" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4cf2bb" stopOpacity=".35"/>
          <stop offset="100%" stopColor="#4cf2bb" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path className="chart-grid" d="M0 28H420M0 66H420M0 104H420M80 0V150M170 0V150M260 0V150M350 0V150"/>
      <path className="chart-area" d="M0 126 C35 112 50 118 78 97 C108 74 124 85 151 73 C177 62 197 75 222 57 C248 39 269 52 291 33 C317 14 347 34 370 20 C390 9 404 12 420 5 L420 150 L0 150 Z"/>
      <path className="chart-line" d="M0 126 C35 112 50 118 78 97 C108 74 124 85 151 73 C177 62 197 75 222 57 C248 39 269 52 291 33 C317 14 347 34 370 20 C390 9 404 12 420 5"/>
    </svg>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-shell">
      <div className="dash-top">
        <strong>HSM</strong>
        <span>Das Charlie’s⌄</span>
        <span>Diese Woche⌄</span>
      </div>
      <div className="dash-body">
        <aside className="dash-sidebar">
          <span className="side-active">▣ Übersicht</span>
          <span>□ Bestand</span>
          <span>◇ Bestellungen</span>
          <span>○ Mitarbeiter</span>
          <span>⌁ Analysen</span>
          <span>◌ Lieferanten</span>
          <span>⚙ Einstellungen</span>
        </aside>
        <div className="dash-main">
          <div className="dash-title"><strong>Übersicht</strong><span>Heute</span></div>
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
              <button>Details ansehen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicePreview({ item }) {
  if (item.id === "software") {
    return (
      <div className="service-preview dashboard-mini">
        <div className="mini-bar"><b>HSM</b><span>Übersicht</span></div>
        <div className="mini-layout">
          <div className="mini-side"></div>
          <div className="mini-content">
            <div className="mini-metrics"><i></i><i></i><i></i></div>
            <MiniChart />
          </div>
        </div>
      </div>
    );
  }
  if (item.id === "social") {
    return (
      <div className="service-preview phone-preview">
        <div className="phone">
          <div className="phone-notch"></div>
          <small>REICHWEITE</small>
          <strong>1,2 Mio.</strong>
          <em>+31%</em>
          <div className="social-bars"><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    );
  }
  if (item.id === "ki") {
    return (
      <div className="service-preview flow-preview">
        <div className="flow-node">Dokument</div><span>→</span><div className="flow-node ai">✦ KI</div><span>→</span><div className="flow-node">Erledigt</div>
      </div>
    );
  }
  return (
    <div className="service-preview web-preview">
      <div className="web-window">
        <div className="browser-dots"><i></i><i></i><i></i></div>
        <div className="web-copy"><small>HSM</small><b>Modern.<br/>Schnell.<br/>Verkaufsstark.</b></div>
      </div>
      <div className="web-phone"></div>
    </div>
  );
}

function ProjectVisual({ kind }) {
  if (kind === "dashboard") return <div className="project-dashboard"><Dashboard /></div>;
  if (kind === "school") return <div className="project-image school-art"><div className="screen-card"><b>Yellow Drive</b><span>Schüler</span><span>Fahrstunden</span><span>Termine</span></div></div>;
  if (kind === "nfc") return <div className="project-image nfc-art"><div className="nfc-chip">NFC</div><div className="nfc-ring"></div></div>;
  return <div className="project-image campaign-art"><div className="campaign-phone"><b>Campaigns</b><span>Active</span><div className="avatar-row"><i></i><i></i><i></i></div></div></div>;
}

function App() {
  return (
    <main>
      <section className="hero" id="top">
        <nav className="nav container">
          <a className="logo" href="#top">HSM</a>
          <div className="nav-links">
            <a href="#software">Custom Softwares</a>
            <a href="#social">Social Media Betreuung</a>
            <a href="#ki">KI Beratung</a>
            <a href="#websites">Websites</a>
            <a href="#projects">Projekte</a>
            <a href="#about">Über uns</a>
          </div>
          <div className="nav-actions">
            <a className="btn btn-ghost" href="#digital-check">Digital Check</a>
            <a className="btn btn-light" href="#contact">Kontakt</a>
          </div>
        </nav>

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>
        <div className="hero-grid container">
          <div className="hero-copy">
            <div className="eyebrow">DIGITALE LÖSUNGEN FÜR ECHTE UNTERNEHMEN</div>
            <h1>Your business.<br/><span>Built better.</span></h1>
            <p className="hero-services">Custom Softwares <b>•</b> Social Media Betreuung <b>•</b> KI Beratung <b>•</b> Websites</p>
            <div className="hero-buttons">
              <a className="btn btn-primary" href="#digital-check">Jetzt Digital Check starten <Arrow /></a>
              <a className="btn btn-dark-outline" href="#projects">Unsere Projekte ansehen</a>
            </div>
            <div className="building-row">
              <div className="avatars"><i>M</i><i>H</i><i>S</i></div>
              <div><small>Aktuell in der Umsetzung</small><b>HSM OS · Gastro Tap · Restaurant Software</b></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glass-shape glass-a"></div>
            <div className="glass-shape glass-b"></div>
            <Dashboard />
          </div>
        </div>
        <div className="hero-terrain"></div>
      </section>

      <section className="services section-light">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow dark">UNSERE LEISTUNGEN</div>
              <h2>Komplette digitale Lösungen<br/>für moderne Unternehmen.</h2>
            </div>
            <p>Wir entwickeln individuelle Software, KI-Systeme, Social Media Strategien und Websites – abgestimmt auf das, was dein Unternehmen wirklich braucht.</p>
          </div>

          <div className="service-grid">
            {services.map((item) => (
              <article className="service-card" id={item.id} key={item.id}>
                <div className={"icon-box " + item.accent}><Icon type={item.icon}/></div>
                <a className="service-title" href={"#" + item.id}>{item.label}<Arrow /></a>
                <p>{item.text}</p>
                <ServicePreview item={item}/>
                <ul>
                  {item.bullets.map((b) => <li key={b}>✓ <span>{b}</span></li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="digital-check section-light" id="digital-check">
        <div className="container digital-grid">
          <div className="digital-copy">
            <div className="eyebrow dark">HSM DIGITAL CHECK</div>
            <h2>Wie digital ist dein Unternehmen wirklich?</h2>
            <p>Finde strukturiert heraus, wo Prozesse unnötig Zeit kosten und welche digitalen Lösungen sinnvoll sein können.</p>
            <a className="btn btn-dark" href="#contact">Kostenlosen Check anfragen <Arrow /></a>
            <div className="steps"><b>1</b><span>2</span><span>3</span><span>4</span><span>5</span></div>
          </div>
          <div className="check-card">
            <div className="progress"><i></i><span>1/5</span></div>
            <h3>Was beschreibt dein Unternehmen am besten?</h3>
            <div className="choice-grid">
              <button>🍴<span>Restaurant / Café / Bar</span></button>
              <button className="selected">▣<span>Lokales Unternehmen</span></button>
              <button>◉<span>Dienstleistung</span></button>
              <button>▤<span>Einzelhandel</span></button>
              <button>🚘<span>Fahrschule</span></button>
              <button>•••<span>Sonstiges</span></button>
            </div>
            <button className="round-next">→</button>
          </div>
        </div>
      </section>

      <section className="projects-section" id="projects">
        <div className="container">
          <div className="projects-head">
            <div><div className="eyebrow">AUSGEWÄHLTE PROJEKTE</div><h2>Echte Lösungen.<br/>In der Praxis.</h2></div>
            <a className="btn btn-dark-outline" href="#contact">Projekt besprechen <Arrow /></a>
          </div>

          <article className="featured-project">
            <div className="featured-copy">
              <span className="project-pill">Restaurant Software</span>
              <h3>Das Charlie’s</h3>
              <p>{projects[0].text}</p>
              <a className="btn btn-dark-outline" href="#contact">Projekt ansehen <Arrow /></a>
            </div>
            <ProjectVisual kind="dashboard"/>
          </article>

          <div className="project-grid">
            {projects.slice(1).map((project) => (
              <article className="small-project" key={project.title}>
                <ProjectVisual kind={project.kind}/>
                <div className="small-project-copy"><div><b>{project.title}</b><span>{project.text}</span></div><button>→</button></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="why-section" id="about">
        <div className="container">
          <div className="eyebrow">WARUM HSM</div>
          <div className="why-top">
            <div><h2>Mehr als eine klassische Agentur.</h2><p>Wir denken nicht nur in einzelnen Leistungen, sondern in digitalen Lösungen, die miteinander funktionieren und zu realen Abläufen im Unternehmen passen.</p></div>
            <div className="why-tags"><span><small>Fokus</small><b>Individuelle Lösungen</b></span><span><small>Zusammenarbeit</small><b>Direkter Kontakt</b></span><span><small>Umsetzung</small><b>Modular & skalierbar</b></span></div>
          </div>
          <div className="why-grid">
            <div><span className="why-icon">▱</span><b>Technisches Know-how</b><p>Wir bauen nicht nur schöne Oberflächen, sondern funktionierende Systeme.</p></div>
            <div><span className="why-icon">✦</span><b>Individuell statt Standard</b><p>Keine starren Pakete. Die Lösung orientiert sich am tatsächlichen Bedarf.</p></div>
            <div><span className="why-icon">◎</span><b>Persönliche Betreuung</b><p>Direkte Kommunikation, kurze Wege und nachvollziehbare Entscheidungen.</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="container cta-grid">
          <div>
            <div className="eyebrow dark">BEREIT FÜR DEN NÄCHSTEN SCHRITT?</div>
            <h2>Lass uns dein<br/>Unternehmen digital stärken.</h2>
            <p>Ob individuelle Software, KI-Lösung, Social Media Betreuung oder eine neue Website – wir entwickeln die passende Lösung für dein Unternehmen.</p>
            <div className="hero-buttons">
              <a className="btn btn-dark" href="mailto:kontakt@haas-saida-media.de">Projekt besprechen <Arrow /></a>
              <a className="btn btn-white-outline" href="#digital-check">Digital Check starten</a>
            </div>
          </div>
          <div className="cta-phone-wrap">
            <div className="orb"></div>
            <div className="cta-phone">
              <div className="phone-notch"></div>
              <b>HSM</b>
              <div className="incoming-card"><span>Neue Anfrage</span><strong>Restaurant Website</strong><small>vor 2 Min.</small></div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-inner"><b>HSM</b><span>Custom Softwares · Social Media Betreuung · KI Beratung · Websites</span><a href="#top">Nach oben ↑</a></div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);