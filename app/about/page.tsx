// ---------- Static About page — no client-side state needed ----------

export default function AboutPage() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>

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

        {/* Hero */}
        <section className="hero" aria-labelledby="about-heading">
          <div className="container">
            <a href="/" className="back-link">← Home</a>
            <h1 id="about-heading" style={{ marginTop: 'var(--space-4)' }}>
              About QashqAI Voice
            </h1>
            <p>
              Giving a digital future to a language that history and technology have overlooked —
              through ethical, community-centred artificial intelligence.
            </p>
          </div>
        </section>

        {/* The Qashqai people */}
        <section className="section" aria-labelledby="people-heading">
          <div className="container">
            <p className="section-label">Who we serve</p>
            <h2 id="people-heading" className="kilim-heading">The Qashqai People</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <div className="about-grid">
              <div className="about-text">
                <p>
                  The Qashqai (also spelled Qashqa'i or Kashkay) are a Turkic-speaking
                  confederation of nomadic and semi-nomadic tribes from the Fars Province
                  of south-western Iran. Historically famed as skilled weavers — the
                  Qashqai kilim is recognised worldwide — they number approximately
                  one to two million people today.
                </p>
                <p>
                  Qashqai is a South-Western Oghuz Turkic language, closely related to
                  Azerbaijani and Turkish, yet distinct in vocabulary, phonology, and the
                  rich oral traditions of its speakers. It is written in a Persian-script
                  orthography and has no standardised written form — meaning every
                  written Qashqai text is itself an act of preservation.
                </p>
                <p>
                  Despite the vibrancy of Qashqai culture, the language is under
                  increasing pressure from Persian-medium education, urbanisation, and
                  the near-total absence of Qashqai-language digital resources. UNESCO
                  classifies it as <strong>vulnerable</strong>.
                </p>
              </div>

              <aside className="about-stat-cards" aria-label="Key facts">
                <div className="stat-card">
                  <span className="stat-card__number">~1–2M</span>
                  <span className="stat-card__label">Qashqai speakers</span>
                </div>
                <div className="stat-card">
                  <span className="stat-card__number">Fars</span>
                  <span className="stat-card__label">Province, Iran</span>
                </div>
                <div className="stat-card stat-card--accent">
                  <span className="stat-card__number">Vulnerable</span>
                  <span className="stat-card__label">UNESCO status</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Project goals */}
        <section className="section" aria-labelledby="goals-heading">
          <div className="container">
            <p className="section-label">Our mission</p>
            <h2 id="goals-heading" className="kilim-heading">Project Goals</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <ol className="goal-list" aria-label="Project goals">
              <li className="goal-item">
                <span className="goal-item__num" aria-hidden="true">01</span>
                <div>
                  <h3 className="goal-item__title">Digital language infrastructure</h3>
                  <p className="goal-item__desc">
                    Build the first open, machine-readable Qashqai language resource —
                    from a phrase corpus to a grammar reference — so that future AI
                    systems can learn from and serve Qashqai speakers.
                  </p>
                </div>
              </li>
              <li className="goal-item">
                <span className="goal-item__num" aria-hidden="true">02</span>
                <div>
                  <h3 className="goal-item__title">Ethical AI design</h3>
                  <p className="goal-item__desc">
                    Develop AI systems with — not merely for — Qashqai communities.
                    Every training decision, safety rule, and content policy must
                    reflect community values and have community sign-off.
                  </p>
                </div>
              </li>
              <li className="goal-item">
                <span className="goal-item__num" aria-hidden="true">03</span>
                <div>
                  <h3 className="goal-item__title">Language learning tools</h3>
                  <p className="goal-item__desc">
                    Provide accessible, browser-based tools for Qashqai learners and
                    heritage speakers around the world — no app installation, no
                    subscription, no language barrier to access.
                  </p>
                </div>
              </li>
              <li className="goal-item">
                <span className="goal-item__num" aria-hidden="true">04</span>
                <div>
                  <h3 className="goal-item__title">Voice corpus collection</h3>
                  <p className="goal-item__desc">
                    Gather a community-contributed audio corpus of spoken Qashqai to
                    underpin future speech recognition and text-to-speech models —
                    with full speaker consent and community data ownership.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Tech principles */}
        <section className="section" aria-labelledby="principles-heading">
          <div className="container">
            <p className="section-label">How we build</p>
            <h2 id="principles-heading" className="kilim-heading">Ethical AI Principles</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <div className="principles-grid">
              {[
                {
                  title: 'Community consent',
                  body:  'No data is collected without explicit, revocable consent. Speakers retain ownership of their recordings and may withdraw at any time.',
                },
                {
                  title: 'Transparency',
                  body:  'The full codebase is open source. Every model decision is documented so community members can audit and challenge outputs.',
                },
                {
                  title: 'Harm avoidance',
                  body:  'A dedicated Cultural Guardian agent reviews every pipeline response for content that could misrepresent or disrespect Qashqai culture.',
                },
                {
                  title: 'No vendor lock-in',
                  body:  'The platform is built on open web standards and open models, so no single company can gate-keep access to Qashqai digital tools.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="principle-card">
                  <h3 className="principle-card__title">{title}</h3>
                  <p  className="principle-card__body">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnerships */}
        <section className="section" aria-labelledby="partners-heading">
          <div className="container">
            <p className="section-label">Get involved</p>
            <h2 id="partners-heading" className="kilim-heading">Partnerships &amp; Collaboration</h2>
            <div className="kilim-strip" aria-hidden="true" />

            <div className="about-text">
              <p>
                QashqAI Voice is an early-stage initiative. We are actively seeking
                collaborators across several areas:
              </p>
            </div>

            {/* Aspiration partners */}
            <div className="partner-aspirations" role="note">
              <p className="partner-aspirations__note">
                The organisations below represent the types of partners we are actively
                seeking to work with. These are aspirational alignments — not confirmed
                partnerships — listed to illustrate the scope of collaboration we envision.
              </p>
              <div className="partner-grid">
                <div className="partner-card partner-card--featured">
                  <span className="partner-card__org">UNESCO</span>
                  <h3 className="partner-card__title">Endangered Language Programme</h3>
                  <p className="partner-card__body">
                    UNESCO's Atlas of the World's Languages in Danger classifies Qashqai
                    as <em>vulnerable</em>. We seek alignment with UNESCO's safeguarding
                    frameworks and documentation standards for endangered oral languages.
                  </p>
                </div>
                <div className="partner-card partner-card--featured">
                  <span className="partner-card__org">Mozilla Foundation</span>
                  <h3 className="partner-card__title">Common Voice &amp; Open Web</h3>
                  <p className="partner-card__body">
                    Mozilla Common Voice has pioneered community-sourced multilingual voice
                    datasets. Adding Qashqai to Common Voice would dramatically accelerate
                    speech model development and ensure open, royalty-free access.
                  </p>
                </div>
                <div className="partner-card partner-card--featured">
                  <span className="partner-card__org">OpenAI</span>
                  <h3 className="partner-card__title">Low-resource Language Research</h3>
                  <p className="partner-card__body">
                    OpenAI's research into low-resource and multilingual language models
                    is directly relevant to Qashqai. We hope to collaborate on
                    responsible model development with built-in cultural safety guardrails.
                  </p>
                </div>
              </div>
            </div>

            <div className="partner-grid" style={{ marginTop: 'var(--space-6)' }}>
              <div className="partner-card">
                <h3 className="partner-card__title">Academic researchers</h3>
                <p className="partner-card__body">
                  Linguists, computational language scientists, and ethnographers working
                  on minority or endangered language documentation.
                </p>
              </div>
              <div className="partner-card">
                <h3 className="partner-card__title">Qashqai community members</h3>
                <p className="partner-card__body">
                  Native speakers, community elders, teachers, and cultural custodians
                  willing to advise on vocabulary, orthography, and cultural safety.
                </p>
              </div>
              <div className="partner-card">
                <h3 className="partner-card__title">NGOs &amp; cultural organisations</h3>
                <p className="partner-card__body">
                  Organisations focused on indigenous language preservation, cultural
                  heritage, or digital inclusion in under-represented communities.
                </p>
              </div>
              <div className="partner-card">
                <h3 className="partner-card__title">Open-source contributors</h3>
                <p className="partner-card__body">
                  Developers, designers, and translators who want to contribute to an
                  ethical AI project with real-world cultural impact.
                </p>
              </div>
            </div>

            <div className="beta-notice" style={{ marginTop: 'var(--space-8)' }}>
              <span className="beta-notice__icon" aria-hidden="true">✉</span>
              <span>
                To get involved, open an issue or start a discussion on the{' '}
                <strong>GitHub repository</strong>. All contributions — code, data,
                linguistic feedback, or design critique — are welcome.
              </span>
            </div>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="footer-note">QashqAI Voice · v0.3.0 · Prototype</p>
          <p className="footer-note">
            Built with ethical AI principles for endangered language preservation.
          </p>
        </div>
      </footer>
    </>
  )
}
