import ChatDemo from './components/ChatDemo'

export default function Home() {
  return (
    <>
      {/* Skip link */}
      <a href="#chat" className="skip-link">
        Skip to chat demo
      </a>

      {/* Header */}
      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">
            Qashq<span>AI</span> Voice
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link">
              Classroom
            </a>
          </nav>
          <span className="site-badge" aria-label="Version 0.3.0 prototype">
            v0.3.0 · prototype
          </span>
        </div>
      </header>

      <main id="main-content">

        {/* Hero */}
        <section className="hero" aria-labelledby="hero-heading">
          <div className="container">
            <h1 id="hero-heading">
              Giving a digital future to <em>voices that history ignored</em>
            </h1>
            <p>
              A cultural–technological initiative for preserving the Qashqai
              language through ethical, community-centred artificial intelligence.
            </p>
          </div>
        </section>

        {/* Supported languages */}
        <section className="section" aria-labelledby="langs-heading">
          <div className="container">
            <p className="section-label">Supported languages</p>
            <h2 id="langs-heading">Four voices, one platform</h2>
            <div className="lang-grid" role="list">
              <div className="lang-card lang-card--accent" role="listitem">
                <span className="lang-card__script" lang="az">قاشقایی</span>
                <span className="lang-card__name">Qashqai</span>
              </div>
              <div className="lang-card" role="listitem">
                <span className="lang-card__script" lang="fa">فارسی</span>
                <span className="lang-card__name">Persian</span>
              </div>
              <div className="lang-card" role="listitem">
                <span className="lang-card__script" lang="tr">Türkçe</span>
                <span className="lang-card__name">Turkish</span>
              </div>
              <div className="lang-card" role="listitem">
                <span className="lang-card__script" lang="en">English</span>
                <span className="lang-card__name">English</span>
              </div>
            </div>
          </div>
        </section>

        {/* Agent pipeline */}
        <section className="section" aria-labelledby="pipeline-heading">
          <div className="container">
            <p className="section-label">How it works</p>
            <h2 id="pipeline-heading">Three-agent pipeline</h2>
            <div className="pipeline" role="list">
              <div className="pipeline-step" role="listitem">
                <p className="pipeline-step__num">01</p>
                <p className="pipeline-step__name">Language Detector</p>
                <p className="pipeline-step__desc">
                  Identifies Qashqai, Persian, Turkish, or English from Unicode script heuristics.
                </p>
              </div>
              <span className="pipeline-arrow" aria-hidden="true">→</span>
              <div className="pipeline-step" role="listitem">
                <p className="pipeline-step__num">02</p>
                <p className="pipeline-step__name">Cultural Guardian</p>
                <p className="pipeline-step__desc">
                  Validates content for cultural safety and respectfulness before processing.
                </p>
              </div>
              <span className="pipeline-arrow" aria-hidden="true">→</span>
              <div className="pipeline-step" role="listitem">
                <p className="pipeline-step__num">03</p>
                <p className="pipeline-step__name">Reasoning Agent</p>
                <p className="pipeline-step__desc">
                  Generates a language-aware response tailored to the detected or selected language.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chat demo */}
        <section id="chat" className="section" aria-labelledby="chat-heading">
          <div className="container">
            <p className="section-label">Live demo</p>
            <h2 id="chat-heading">Try the platform</h2>
            <ChatDemo idPrefix="home-chat" />
          </div>
        </section>
      </main>

      {/* Footer */}
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
