import ChatDemo, { SamplePhrase } from '../components/ChatDemo'

// ---------- Data types ----------

interface ClassroomPhrase {
  qashqai:  string   // Arabic-script Qashqai
  phonetic: string   // Latin romanisation (syllable dots = stress break)
  en:       string
  fa:       string
}

interface PhraseCategory {
  id:      string
  label:   string   // section-label chip text
  heading: string   // h3
  phrases: ClassroomPhrase[]
}

// ---------- Phrase data ----------

const CATEGORIES: PhraseCategory[] = [
  {
    id:      'greetings',
    label:   'Section 1',
    heading: 'Greetings & Basics',
    phrases: [
      { qashqai: 'سلام',          phonetic: 'sa·lam',        en: 'Hello',               fa: 'سلام' },
      { qashqai: 'خوش گلدین',     phonetic: 'xoş gel·din',   en: 'Welcome',             fa: 'خوش آمدی' },
      { qashqai: 'سن نئجه‌سین؟',  phonetic: 'sən ne·ce·sin', en: 'How are you?',        fa: 'حال شما چطور است؟' },
      { qashqai: 'ای یاخشی',      phonetic: 'ay yax·şı',     en: 'I am fine',           fa: 'خوبم' },
      { qashqai: 'ممنون',         phonetic: 'mem·nun',        en: 'Thank you',           fa: 'ممنون' },
      { qashqai: 'خداحافظ',       phonetic: 'xo·da·ha·fez',  en: 'Goodbye',             fa: 'خداحافظ' },
      { qashqai: 'بئله',          phonetic: 'be·le',          en: 'Yes',                 fa: 'بله' },
      { qashqai: 'خئیر',          phonetic: 'xeyr',           en: 'No',                  fa: 'نه' },
      { qashqai: 'من قاشقایام',   phonetic: 'mən qaş·qa·yam', en: 'I am Qashqai',      fa: 'من قشقایی هستم' },
      { qashqai: 'بو دیل بیزیم دیلیمیز', phonetic: 'bu dil bi·zim di·li·miz', en: 'This language is ours', fa: 'این زبان، زبان ماست' },
    ],
  },
  {
    id:      'numbers',
    label:   'Section 2',
    heading: 'Numbers 1–10',
    phrases: [
      { qashqai: 'بیر',    phonetic: 'bir',      en: 'One (1)',    fa: 'یک' },
      { qashqai: 'ایکی',   phonetic: 'i·ki',     en: 'Two (2)',    fa: 'دو' },
      { qashqai: 'اوچ',    phonetic: 'üç',       en: 'Three (3)', fa: 'سه' },
      { qashqai: 'دؤرد',   phonetic: 'dörd',     en: 'Four (4)',  fa: 'چهار' },
      { qashqai: 'بئش',    phonetic: 'beş',      en: 'Five (5)',  fa: 'پنج' },
      { qashqai: 'آلتی',   phonetic: 'al·tı',    en: 'Six (6)',   fa: 'شش' },
      { qashqai: 'یئدّی',  phonetic: 'yed·di',   en: 'Seven (7)', fa: 'هفت' },
      { qashqai: 'سکّیز',  phonetic: 'sək·kiz',  en: 'Eight (8)', fa: 'هشت' },
      { qashqai: 'دوقّوز', phonetic: 'doq·quz',  en: 'Nine (9)',  fa: 'نه' },
      { qashqai: 'اون',    phonetic: 'on',        en: 'Ten (10)', fa: 'ده' },
    ],
  },
  {
    id:      'animals',
    label:   'Section 3',
    heading: 'Animals',
    phrases: [
      { qashqai: 'آت',    phonetic: 'at',        en: 'Horse',  fa: 'اسب' },
      { qashqai: 'ایت',   phonetic: 'it',        en: 'Dog',    fa: 'سگ' },
      { qashqai: 'پیشیک', phonetic: 'pi·şik',    en: 'Cat',    fa: 'گربه' },
      { qashqai: 'قویون', phonetic: 'qo·yun',    en: 'Sheep',  fa: 'گوسفند' },
      { qashqai: 'اینک',  phonetic: 'i·nək',     en: 'Cow',    fa: 'گاو' },
      { qashqai: 'گئچی',  phonetic: 'ke·çi',     en: 'Goat',   fa: 'بز' },
      { qashqai: 'ائشّک', phonetic: 'eş·şek',    en: 'Donkey', fa: 'الاغ' },
      { qashqai: 'قوش',   phonetic: 'quş',       en: 'Bird',   fa: 'پرنده' },
      { qashqai: 'بالیق', phonetic: 'ba·lıq',    en: 'Fish',   fa: 'ماهی' },
      { qashqai: 'قورد',  phonetic: 'qurd',      en: 'Wolf',   fa: 'گرگ' },
    ],
  },
]

// Chat chips — a representative mix from all categories
const CHAT_PHRASES: SamplePhrase[] = [
  { language: 'qashqai', text: 'سلام',           label: 'Qashqai: Hello' },
  { language: 'qashqai', text: 'سن نئجه‌سین؟',  label: 'Qashqai: How are you?' },
  { language: 'qashqai', text: 'ممنون',          label: 'Qashqai: Thank you' },
  { language: 'qashqai', text: 'بیر ایکی اوچ',  label: 'Qashqai: One two three' },
  { language: 'qashqai', text: 'آت و قویون',    label: 'Qashqai: Horse and sheep' },
  { language: 'qashqai', text: 'من قاشقایام',   label: 'Qashqai: I am Qashqai' },
]

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
              Qashqai Classroom{' '}
              <em style={{ fontSize: '0.6em', verticalAlign: 'middle' }}>Beta</em>
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
                reflect community-validated Qashqai orthography. Phonetics use a simplified
                Latin romanisation; syllable breaks are marked with a centre dot (·).
              </span>
            </div>

            <div className="classroom-intro">
              <div className="classroom-intro__block">
                <p className="classroom-intro__lang">English</p>
                <p className="classroom-intro__text">
                  Welcome to the QashqAI Classroom — an interactive space for exploring
                  the Qashqai language. Browse the phrase cards below (greetings, numbers,
                  and animals), then use the chat area to practise with the AI pipeline.
                </p>
              </div>
              <div className="classroom-intro__block" dir="rtl" lang="fa">
                <p className="classroom-intro__lang" style={{ textAlign: 'right' }}>فارسی</p>
                <p className="classroom-intro__text" dir="rtl">
                  به کلاس درس QashqAI خوش آمدید — فضایی تعاملی برای آشنایی با زبان
                  قشقایی. کارت‌های عبارات زیر (احوال‌پرسی، اعداد و نام حیوانات) را مرور
                  کنید و سپس از بخش چت برای تمرین با هوش مصنوعی استفاده کنید.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Phrase categories */}
        {CATEGORIES.map((cat) => (
          <section
            key={cat.id}
            id={cat.id}
            className="section"
            aria-labelledby={`${cat.id}-heading`}
          >
            <div className="container">
              <p className="section-label">{cat.label}</p>
              <h2 id={`${cat.id}-heading`}>{cat.heading}</h2>
              <div className="phrase-cards" role="list">
                {cat.phrases.map((phrase) => (
                  <article
                    key={phrase.qashqai}
                    className="phrase-card"
                    role="listitem"
                    aria-label={`${phrase.en} in Qashqai`}
                  >
                    {/* Qashqai script — RTL */}
                    <p className="phrase-card__qashqai" lang="az" dir="rtl">
                      {phrase.qashqai}
                    </p>

                    {/* Phonetic pronunciation */}
                    <p className="phrase-card__phonetic" aria-label={`Pronunciation: ${phrase.phonetic}`}>
                      /{phrase.phonetic}/
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
                        <span className="phrase-card__translation" lang="fa" dir="rtl">
                          {phrase.fa}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

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
