// Static About page — server component, no client-side state needed

const PRINCIPLES = [
  {
    icon: '🛡',
    title: 'Cultural Data Sovereignty',
    body:  'Communities own their language data. No recording, annotation, or model weight may be used without explicit, revocable community consent.',
  },
  {
    icon: '🤝',
    title: 'Community Consent',
    body:  'Every speaker is a partner, not a subject. Participation is voluntary, informed, and withdrawable at any time — with full data deletion.',
  },
  {
    icon: '🚫',
    title: 'Non-Extractive AI',
    body:  'Technology must give back more than it takes. Models trained on Qashqai data must benefit Qashqai speakers first, before any other application.',
  },
  {
    icon: '📖',
    title: 'Transparent Documentation',
    body:  'Every design decision, training choice, and content policy is documented openly. Nothing is hidden behind proprietary processes.',
  },
  {
    icon: '✨',
    title: 'Digital Dignity',
    body:  'Minority-language speakers deserve the same quality of digital tools as speakers of dominant languages — without compromise or condescension.',
  },
]

const GOALS = [
  {
    num:   '01',
    title: 'Document elderly speakers',
    body:  'Record and archive the voices of elder speakers before irreplaceable knowledge is lost. Every recording is an act of preservation.',
  },
  {
    num:   '02',
    title: 'Build an open speech dataset',
    body:  'Create the first open-source, community-owned Qashqai speech corpus — freely available for research, education, and model training.',
  },
  {
    num:   '03',
    title: 'Educational tools for diaspora youth',
    body:  'Build browser-based classroom tools that diaspora youth can access worldwide — no app, no subscription, no barrier to heritage.',
  },
  {
    num:   '04',
    title: 'A replicable model for other languages',
    body:  'Prove that ethical, community-led language AI is possible, and publish a blueprint for the ~6,900 other languages that technology has overlooked.',
  },
]

const PARTNERS = [
  { org: 'UNESCO',               note: 'Endangered Language Programme' },
  { org: 'Mozilla Common Voice', note: 'Open voice dataset infrastructure' },
  { org: 'European Union',       note: 'Cultural heritage & digital inclusion' },
  { org: 'OpenAI',               note: 'Low-resource language research' },
  { org: 'Goethe-Institut',      note: 'German cultural exchange programmes' },
  { org: 'ELDP',                 note: 'Endangered Languages Documentation' },
]

export default function AboutPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>

      {/* ── Header ── */}
      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">
            Qashq<span>AI</span> Voice
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link">Classroom</a>
            <a href="/record"    className="site-nav__link">Record</a>
            <a href="/about"     className="site-nav__link" aria-current="page">About</a>
          </nav>
          <span className="site-badge">v0.3.0 · prototype</span>
        </div>
      </header>

      <main id="main-content">

        {/* ══════════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════════ */}
        <section id="about" className="about-hero" aria-labelledby="about-heading">
          <div className="container">
            <a href="/" className="back-link">← Home</a>

            <div className="about-hero__content">
              <p className="section-label">QashqAI Voice</p>
              <h1 id="about-heading" className="about-hero__title">
                Preserving the Qashqai Language
                <br />
                <em className="about-hero__em">Through Ethical AI</em>
              </h1>
              <p className="about-hero__lead">
                A digital initiative born in the Qashqai diaspora — giving one of the world's
                most overlooked languages its rightful place in the age of artificial intelligence.
              </p>
            </div>

            {/* In-page section navigation */}
            <nav className="about-page-nav" aria-label="Page sections">
              <ul className="about-page-nav__list" role="list">
                {[
                  ['#mission',      'Mission'],
                  ['#people',       'The People'],
                  ['#principles',   'Principles'],
                  ['#goals',        'Goals'],
                  ['#partnerships', 'Partners'],
                  ['#founder',      'Founder'],
                  ['#join',         'Get Involved'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="about-page-nav__link">{label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2. MISSION
        ══════════════════════════════════════════════ */}
        <section id="mission" className="section about-mission" aria-labelledby="mission-heading">
          <div className="container">
            <p className="section-label">Why this project</p>
            <h2 id="mission-heading" className="kilim-heading">Bridging the Digital Language Gap</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <p className="about-lead">
              The Qashqai language is spoken by approximately <strong>1.5 million nomadic
              people</strong> in southern Iran. It carries a living archive of migration routes,
              ecological knowledge, weaving traditions, and oral poetry accumulated over centuries.
            </p>
            <p className="about-lead">
              Yet Qashqai is almost entirely invisible in the digital world. Of the roughly
              7,000 languages spoken on Earth, <strong>fewer than 100 are meaningfully
              represented in AI systems</strong>. Qashqai is not among them. QashqAI Voice
              exists to change that — ethically, transparently, and in partnership with the
              Qashqai community itself.
            </p>

            {/* Stats bar */}
            <div className="stats-bar" aria-label="Key statistics">
              <div className="stats-bar__item">
                <span className="stats-bar__number">~1.5M</span>
                <span className="stats-bar__label">Qashqai speakers worldwide</span>
              </div>
              <div className="stats-bar__divider" aria-hidden="true" />
              <div className="stats-bar__item">
                <span className="stats-bar__number">7,000</span>
                <span className="stats-bar__label">Languages spoken on Earth</span>
              </div>
              <div className="stats-bar__divider" aria-hidden="true" />
              <div className="stats-bar__item stats-bar__item--accent">
                <span className="stats-bar__number">&lt;100</span>
                <span className="stats-bar__label">Languages represented in AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3. THE QASHQAI PEOPLE
        ══════════════════════════════════════════════ */}
        <section id="people" className="section" aria-labelledby="people-heading">
          <div className="container">
            <p className="section-label">Who we serve</p>
            <h2 id="people-heading" className="kilim-heading">The Qashqai People</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <div className="about-grid">
              <div className="about-text">
                <p>
                  The Qashqai (also spelled Qashqa'i or Kashkay) are a Turkic-speaking confederation
                  of nomadic and semi-nomadic tribes from the <strong>Fars Province of south-western
                  Iran</strong>. For centuries they have made twice-yearly migrations across the Zagros
                  mountains — one of the longest traditional nomadic routes on Earth — travelling with
                  their flocks between winter lowlands and summer highland pastures.
                </p>
                <p>
                  They are renowned worldwide for <strong>Qashqai kilim weaving</strong> — intricate
                  geometric textiles that encode cultural history, family lineage, and natural symbolism
                  in every pattern. This visual language of the kilim mirrors the spoken language itself:
                  layered, precise, and irreplaceable.
                </p>
                <p>
                  Qashqai is a <strong>South-Western Oghuz Turkic language</strong>, closely related
                  to Azerbaijani and Turkish yet distinct in vocabulary, phonology, and the rich oral
                  traditions of its speakers — epic poetry, proverbs, lullabies, and migration songs
                  passed from generation to generation by voice alone.
                </p>
                <p>
                  Despite the vibrancy of Qashqai culture, the language is under increasing pressure
                  from Persian-medium education, urbanisation, and the near-total absence of digital
                  resources. UNESCO classifies it as <strong>vulnerable</strong>.
                </p>
              </div>

              <aside className="about-stat-cards" aria-label="Key facts">
                <div className="stat-card">
                  <span className="stat-card__number">~1.5M</span>
                  <span className="stat-card__label">Speakers</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card__number">Fars</span>
                  <span className="stat-card__label">Province, Iran</span>
                </div>
                <div className="stat-card stat-card--accent">
                  <span className="stat-card__number">Vulnerable</span>
                  <span className="stat-card__label">UNESCO classification</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. PRINCIPLES
        ══════════════════════════════════════════════ */}
        <section id="principles" className="section about-alt-bg" aria-labelledby="principles-heading">
          <div className="container">
            <p className="section-label">How we work</p>
            <h2 id="principles-heading" className="kilim-heading">Core Principles</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <div className="principles-grid">
              {PRINCIPLES.map(({ icon, title, body }) => (
                <div key={title} className="principle-card">
                  <span className="principle-card__icon" aria-hidden="true">{icon}</span>
                  <h3 className="principle-card__title">{title}</h3>
                  <p  className="principle-card__body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. GOALS
        ══════════════════════════════════════════════ */}
        <section id="goals" className="section" aria-labelledby="goals-heading">
          <div className="container">
            <p className="section-label">Our aims</p>
            <h2 id="goals-heading" className="kilim-heading">Project Goals</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <ol className="goal-list" aria-label="Project goals">
              {GOALS.map(({ num, title, body }) => (
                <li key={num} className="goal-item">
                  <span className="goal-item__num" aria-hidden="true">{num}</span>
                  <div>
                    <h3 className="goal-item__title">{title}</h3>
                    <p  className="goal-item__desc">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            6. PARTNERSHIPS
        ══════════════════════════════════════════════ */}
        <section id="partnerships" className="section about-alt-bg" aria-labelledby="partnerships-heading">
          <div className="container">
            <p className="section-label">Collaborators</p>
            <h2 id="partnerships-heading" className="kilim-heading">Partnerships</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <p className="about-lead">
              QashqAI Voice is an early-stage initiative actively seeking partners across
              linguistics, technology, cultural heritage, and policy.
            </p>

            <div
              className="partner-org-grid"
              role="list"
              aria-label="Partner organisations"
            >
              {PARTNERS.map(({ org, note }) => (
                <div key={org} className="partner-org" role="listitem">
                  <span className="partner-org__name">{org}</span>
                  <span className="partner-org__note">{note}</span>
                </div>
              ))}
            </div>

            <p className="partner-disclaimer">
              Organisations listed represent aspirational partnerships — not confirmed
              engagements. Listed to illustrate the scope of collaboration we seek.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7. FOUNDER
        ══════════════════════════════════════════════ */}
        <section id="founder" className="section" aria-labelledby="founder-heading">
          <div className="container">
            <p className="section-label">Who built this</p>
            <h2 id="founder-heading" className="kilim-heading">The Founder</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <div className="founder-card">
              <div className="founder-avatar" aria-hidden="true">S</div>
              <div className="founder-bio">
                <h3 className="founder-bio__name">Sifollah Aslanijam</h3>
                <p className="founder-bio__role">
                  Cultural Technologist · German-Iranian · Qashqai diaspora
                </p>
                <p className="founder-bio__text">
                  Sifollah is a German-Iranian cultural technologist with roots in the Qashqai
                  confederation. Trained at the intersection of <strong>philosophy, social work,
                  and AI ethics</strong>, he founded QashqAI Voice out of a personal and
                  political conviction: that the absence of a language in technology is not a
                  neutral fact — it is a choice, and a reversible one.
                </p>
                <p className="founder-bio__text">
                  Growing up between Iran and Germany, Sifollah experienced first-hand how
                  diaspora communities lose linguistic connection across generations when no
                  digital infrastructure exists to support heritage languages. QashqAI Voice is
                  his answer — combining technical skills with deep cultural responsibility.
                </p>
                <div className="founder-bio__tags" aria-label="Areas of expertise">
                  {['AI Ethics', 'Language Preservation', 'Cultural Technology',
                    'Social Work', 'Philosophy', 'Open Source'].map((tag) => (
                    <span key={tag} className="rec-tag rec-tag--speaker">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8. CONTACT / JOIN
        ══════════════════════════════════════════════ */}
        <section id="join" className="section about-alt-bg" aria-labelledby="join-heading">
          <div className="container">
            <p className="section-label">Get involved</p>
            <h2 id="join-heading" className="kilim-heading">Join the Mission</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <p className="about-lead">
              Every contribution — a recording, a line of code, a linguistic correction, a
              shared link — makes the Qashqai language more visible in the world.
            </p>

            <div className="cta-grid">
              <div className="cta-card">
                <span className="cta-card__icon" aria-hidden="true">🎙</span>
                <h3 className="cta-card__title">Record your voice</h3>
                <p className="cta-card__body">
                  Native or heritage speakers: contribute recordings of words, phrases,
                  stories, or songs. All takes stay in your browser — nothing is uploaded
                  without your explicit consent.
                </p>
                <a href="/record" className="cta-card__link btn btn--primary">
                  Open recorder
                </a>
              </div>

              <div className="cta-card">
                <span className="cta-card__icon" aria-hidden="true">💻</span>
                <h3 className="cta-card__title">Contribute code</h3>
                <p className="cta-card__body">
                  Developers, designers, and translators: the full codebase is open source.
                  Open an issue, submit a pull request, or help translate the interface into
                  Qashqai, Persian, Turkish, or German.
                </p>
                <a
                  href="https://github.com/sifollahaslani/qashqai-voice-platform"
                  className="cta-card__link btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </div>

              <div className="cta-card">
                <span className="cta-card__icon" aria-hidden="true">🌍</span>
                <h3 className="cta-card__title">Partner with us</h3>
                <p className="cta-card__body">
                  Researchers, cultural organisations, NGOs, and institutions: we are
                  seeking collaborators in linguistics, heritage preservation, AI safety,
                  and digital inclusion. Let's build something meaningful together.
                </p>
                <a
                  href="mailto:contact@qashqai-voice.org"
                  className="cta-card__link btn btn--primary"
                >
                  Get in touch
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="footer-note">QashqAI Voice · v0.3.0 · Prototype</p>
          <p className="footer-note">
            Built with ethical AI principles for Qashqai language preservation.
          </p>
        </div>
      </footer>
    </>
  )
}
