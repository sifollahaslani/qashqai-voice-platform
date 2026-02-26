'use client'

import { useState } from 'react'

// ---------- Types ----------

export type Language = 'qashqai' | 'fa' | 'tr' | 'en' | 'auto'

export interface SamplePhrase {
  language: Language
  text: string
  label: string
}

interface AgentStep {
  agent: string
  text: string
}

interface ChatResult {
  detected_language: string
  steps: AgentStep[]
  final: AgentStep
}

// ---------- Constants ----------

const AGENT_LABELS: Record<string, string> = {
  language_detector: 'Language Detector',
  cultural_guardian: 'Cultural Guardian',
  reasoner:          'Reasoning Agent',
}

export const DEFAULT_SAMPLE_PHRASES: SamplePhrase[] = [
  { language: 'qashqai', text: 'سلام، سن نئجه‌سین؟',   label: 'Qashqai: Hello, how are you?' },
  { language: 'qashqai', text: 'من قاشقایام',           label: 'Qashqai: I am Qashqai' },
  { language: 'qashqai', text: 'بو دیل بیزیم دیلیمیز',   label: 'Qashqai: This language is ours' },
  { language: 'fa',      text: 'سلام، چطوری؟',          label: 'Persian: Hello, how are you?' },
  { language: 'tr',      text: 'Merhaba, nasılsın?',    label: 'Turkish: Hello, how are you?' },
  { language: 'en',      text: 'Hello, how are you?',   label: 'English: Hello, how are you?' },
]

// ---------- Component ----------

interface ChatDemoProps {
  samplePhrases?: SamplePhrase[]
  /** Unique prefix for form element IDs — avoids duplicates when used on the same page twice. */
  idPrefix?: string
}

export default function ChatDemo({
  samplePhrases = DEFAULT_SAMPLE_PHRASES,
  idPrefix = 'chat',
}: ChatDemoProps) {
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

  return (
    <>
      <form
        className="chat-form"
        onSubmit={handleSubmit}
        aria-label="Send a message to the QashqAI agent pipeline"
      >
        {/* Language select */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`${idPrefix}-lang`} className="form-label">
              Language
            </label>
            <select
              id={`${idPrefix}-lang`}
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

        {/* Sample phrase chips */}
        <div>
          <p className="form-label" id={`${idPrefix}-phrases-label`}>
            Sample phrases — click to fill
          </p>
          <div
            className="phrase-chips"
            role="group"
            aria-labelledby={`${idPrefix}-phrases-label`}
          >
            {samplePhrases.map((phrase) => (
              <button
                key={phrase.label}
                type="button"
                className="phrase-chip"
                data-lang={phrase.language}
                aria-label={`Use sample: ${phrase.label}`}
                onClick={() => { setText(phrase.text); setLanguage(phrase.language) }}
              >
                {phrase.text}
              </button>
            ))}
          </div>
        </div>

        {/* Message textarea */}
        <div className="form-group">
          <label htmlFor={`${idPrefix}-msg`} className="form-label">
            Your message
          </label>
          <textarea
            id={`${idPrefix}-msg`}
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
    </>
  )
}
