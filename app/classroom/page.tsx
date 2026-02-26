import ChatDemo, { SamplePhrase } from '../components/ChatDemo'

// ---------- Classroom phrase data ----------

interface ClassroomPhrase {
  qashqai: string
  en: string
  fa: string
}

const CLASSROOM_PHRASES: ClassroomPhrase[] = [
  { qashqai: 'سلام',                     en: 'Hello',                    fa: 'سلام' },
  { qashqai: 'سن نئجه‌سین؟',              en: 'How are you?',             fa: 'حال شما چطور است؟' },
  { qashqai: 'من قاشقایام',               en: 'I am Qashqai',             fa: 'من قشقایی هستم' },
  { qashqai: 'ممنون',                     en: 'Thank you',                fa: 'ممنون' },
  { qashqai: 'بو نه‌دیر؟',               en: 'What is this?',            fa: 'این چیست؟' },
  { qashqai: 'بو دیل بیزیم دیلیمیز',     en: 'This language is ours',    fa: 'این زبان، زبان ماست' },
  { qashqai: 'خوش گلدین!',               en: 'Welcome!',                 fa: 'خوش آمدی!' },
  { qashqai: 'گئدیریم',                   en: 'I am going',               fa: 'دارم می‌روم' },
]

// Chat chips: Qashqai phrases only, so the demo stays on-topic
const CHAT_PHRASES: SamplePhrase[] = CLASSROOM_PHRASES.map((p) => ({
  language: 'qashqai',
  text:     p.qashqai,
  label:    `Qashqai: ${p.en}`,
}))

// ---------- Page ----------

export default function ClassroomPage() {
  return (
    <>
      {/* Skip link */}
      <a href="#classroom-chat" className="skip-link">
        Skip to chat practice
      </a>

      {/* Header */}
      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">
            Qashq<span>AI</span> Voice
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link" aria-current="page">
              Classroom
            </a>
          </nav>
          <span className="site-badge">v0.3.0 · prototype</span>
        </div>
      </header>

      <main id="main-content">

        {/* Page hero */}
        <section className="hero" aria-labelledby="classroom-heading">
          <div className="container">
            <a href="/" className="back-link" aria-label="Back to home">
              ← Home
            </a>
            <h1 id="classroom-heading" style={{ marginTop: 'var(--space-4)' }}>
              Qashqai Classroom <em style={{ fontSize: '0.6em', verticalAlign: 'middle' }}>Beta</em>
            </h1>
          </div>
        </section>

        {/* Intro — bilingual EN + FA */}
        <section className="section" aria-labelledby="intro-heading">
          <div className="container">
            <p className="section-label">About this page</p>
            <h2 id="intro-heading" className="sr-only">Introduction</h2>

            <div role="note" className="beta-notice">
              <span className="beta-notice__icon" aria-hidden="true">ⓘ</span>
              <span>
                This is an early-stage demo. Phrase translations are illustrative and may not yet
                reflect community-validated Qashqai orthography.
              </span>
            </div>

            <div className="classroom-intro">
              <div className="classroom-intro__block">
                <p className="classroom-intro__lang">English</p>
                <p className="classroom-intro__text">
                  Welcome to the QashqAI Classroom — an interactive space for exploring
                  the Qashqai language. Browse the phrase cards below to learn common
                  expressions, then use the chat area to practise with the AI pipeline.
                </p>
              </div>
              <div className="classroom-intro__block" dir="rtl" lang="fa">
                <p className="classroom-intro__lang" style={{ textAlign: 'right' }}>فارسی</p>
                <p className="classroom-intro__text" dir="rtl">
                  به کلاس درس QashqAI خوش آمدید — فضایی تعاملی برای آشنایی با
                  زبان قشقایی. کارت‌های عبارات زیر را مرور کنید و سپس از بخش چت
                  برای تمرین با هوش مصنوعی استفاده کنید.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phrase cards */}
        <section className="section" aria-labelledby="phrases-heading">
          <div className="container">
            <p className="section-label">Vocabulary</p>
            <h2 id="phrases-heading">Common Qashqai phrases</h2>
            <div className="phrase-cards" role="list">
              {CLASSROOM_PHRASES.map((phrase) => (
                <article
                  key={phrase.qashqai}
                  className="phrase-card"
                  role="listitem"
                  aria-label={`Qashqai phrase: ${phrase.en}`}
                >
                  {/* Qashqai — RTL */}
                  <p className="phrase-card__qashqai" lang="az" dir="rtl">
                    {phrase.qashqai}
                  </p>

                  {/* Translations */}
                  <div className="phrase-card__translations">
                    <div className="phrase-card__row">
                      <span className="phrase-card__lang-tag" aria-label="English">EN</span>
                      <span className="phrase-card__translation" lang="en">
                        {phrase.en}
                      </span>
                    </div>
                    <div className="phrase-card__row">
                      <span className="phrase-card__lang-tag" aria-label="Persian">FA</span>
                      <span
                        className="phrase-card__translation"
                        lang="fa"
                        dir="rtl"
                      >
                        {phrase.fa}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Chat practice */}
        <section id="classroom-chat" className="section" aria-labelledby="chat-practice-heading">
          <div className="container">
            <p className="section-label">Practice</p>
            <h2 id="chat-practice-heading">Chat with the AI</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
              Use the phrases above or type your own Qashqai text. The AI pipeline will
              detect your language, apply cultural checks, and respond.
            </p>
            <ChatDemo samplePhrases={CHAT_PHRASES} idPrefix="classroom-chat" />
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
