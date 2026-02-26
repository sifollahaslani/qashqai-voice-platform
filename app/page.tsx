'use client'

import { useState } from 'react'

// ---------- Types ----------

type Language = 'qashqai' | 'fa' | 'tr' | 'en' | 'auto'

interface AgentStep {
  agent: string
  text: string
}

interface ChatResult {
  detected_language: string
  steps: AgentStep[]
  final: AgentStep
}

// ---------- Sample phrases ----------

const SAMPLE_PHRASES: { language: Language; text: string; label: string }[] = [
  { language: 'qashqai', text: 'سلام، سن نئجه‌سین؟',   label: 'Qashqai: Hello, how are you?' },
  { language: 'qashqai', text: 'من قاشقایام',           label: 'Qashqai: I am Qashqai' },
  { language: 'qashqai', text: 'بو دیل بیزیم دیلیمیز',   label: 'Qashqai: This language is ours' },
  { language: 'fa',      text: 'سلام، چطوری؟',          label: 'Persian: Hello, how are you?' },
  { language: 'tr',      text: 'Merhaba, nasılsın?',    label: 'Turkish: Hello, how are you?' },
  { language: 'en',      text: 'Hello, how are you?',   label: 'English: Hello, how are you?' },
]

// ---------- Agent label map ----------

const AGENT_LABELS: Record<string, string> = {
  language_detector: 'Language Detector',
  cultural_guardian: 'Cultural Guardian',
  reasoner:          'Reasoning Agent',
}

// ---------- Component ----------

export default function Home() {
  const [language, setLanguage] = useState<Language>('auto')
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<ChatResult | null>(null)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload =
        language === 'auto'
          ? { text }
          : { language, text }

      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const detail = await res.text()
        throw new Error(`Server error ${res.status}: ${detail}`)
      }

      const data: ChatResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function applyPhrase(phrase: (typeof SAMPLE_PHRASES)[number]) {
    setText(phrase.text)
    setLanguage(phrase.language)
  }

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

            <form
              className="chat-form"
              onSubmit={handleSubmit}
              aria-label="Send a message to the QashqAI agent pipeline"
            >
              {/* Language select */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lang-select" className="form-label">
                    Language
                  </label>
                  <select
                    id="lang-select"
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="qashqai">Qashqai (قاشقایی)</option>
                    <option value="fa">Persian (فارسی)</option>
                    <option value="tr">Turkish (Türkçe)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Sample phrases */}
              <div>
                <p className="form-label" id="phrases-label">
                  Sample phrases — click to fill
                </p>
                <div
                  className="phrase-chips"
                  role="group"
                  aria-labelledby="phrases-label"
                >
                  {SAMPLE_PHRASES.map((phrase) => (
                    <button
                      key={phrase.label}
                      type="button"
                      className="phrase-chip"
                      data-lang={phrase.language}
                      aria-label={`Use sample: ${phrase.label}`}
                      onClick={() => applyPhrase(phrase)}
                    >
                      {phrase.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message textarea */}
              <div className="form-group">
                <label htmlFor="msg-input" className="form-label">
                  Your message
                </label>
                <textarea
                  id="msg-input"
                  className="form-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or choose a sample phrase above…"
                  rows={4}
                  dir="auto"
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !text.trim()}
                aria-busy={loading}
              >
                {loading ? 'Processing…' : 'Send'}
              </button>
            </form>

            {/* Output */}
            <div
              className="chat-output"
              aria-live="polite"
              aria-atomic="false"
              aria-label="Agent pipeline output"
            >
              {error && (
                <div className="chat-error" role="alert">
                  {error}
                </div>
              )}

              {result && result.steps.map((step, i) => {
                const isFinal = step.agent === result.final.agent && i === result.steps.length - 1
                return (
                  <div
                    key={`${step.agent}-${i}`}
                    className={`agent-step${isFinal ? ' agent-step--final' : ''}`}
                  >
                    <p className="agent-step__label">
                      {AGENT_LABELS[step.agent] ?? step.agent}
                      {isFinal && ' · final response'}
                    </p>
                    <p className="agent-step__text" dir="auto">
                      {step.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <p className="footer-note">
            QashqAI Voice · v0.3.0 · Prototype
          </p>
          <p className="footer-note">
            Built with ethical AI principles for endangered language preservation.
          </p>
        </div>
      </footer>
    </>
  )
}
