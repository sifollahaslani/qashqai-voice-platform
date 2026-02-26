'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { CATEGORIES, ALL_PHRASES, type Phrase } from '../data/classroom-phrases'

// ─── Web Speech TTS ────────────────────────────────────────────────────────

/**
 * Speak a Qashqai phrase using the browser's Speech Synthesis API.
 * We use Turkish (tr-TR) as the closest available voice for Latin-script
 * Qashqai — it is mutually intelligible at the phoneme level.
 * This is a best-effort fallback; dedicated Qashqai TTS is a future goal.
 */
function speakPhrase(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang  = 'tr-TR'
  u.rate  = 0.85
  window.speechSynthesis.speak(u)
}

// ─── PhraseCard ────────────────────────────────────────────────────────────

interface CardProps {
  phrase:        Phrase
  categoryLabel?: string   // shown when rendering search results
}

function PhraseCard({ phrase, categoryLabel }: CardProps) {
  const [speaking, setSpeaking] = useState(false)

  function handleSpeak() {
    setSpeaking(true)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const u  = new SpeechSynthesisUtterance(phrase.latin)
      u.lang   = 'tr-TR'
      u.rate   = 0.85
      u.onend  = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(u)
    } else {
      setTimeout(() => setSpeaking(false), 600)
    }
  }

  return (
    <article className="pc" aria-label={`${phrase.en} in Qashqai`}>
      {/* Category badge — visible in search results only */}
      {categoryLabel && (
        <span className="pc__cat-badge">{categoryLabel}</span>
      )}

      {/* ── Card header: Arabic script + audio button ── */}
      <div className="pc__header">
        <p className="pc__arabic" lang="az" dir="rtl">
          {phrase.arabic}
        </p>
        <button
          className={`pc__audio-btn${speaking ? ' pc__audio-btn--active' : ''}`}
          onClick={handleSpeak}
          aria-label={`Play pronunciation of ${phrase.en}`}
          aria-pressed={speaking}
          title="Play (Turkish voice — Qashqai TTS coming soon)"
        >
          {speaking ? '◼' : '▶'}
        </button>
      </div>

      {/* ── Latin script + phonetic ── */}
      <p className="pc__latin">{phrase.latin}</p>
      {phrase.phonetic && (
        <p className="pc__phonetic" aria-label={`Pronunciation: ${phrase.phonetic}`}>
          /{phrase.phonetic}/
        </p>
      )}

      {/* ── Translations ── */}
      <dl className="pc__translations">
        <div className="pc__row">
          <dt className="pc__lang-tag" aria-label="English">EN</dt>
          <dd className="pc__translation" lang="en">{phrase.en}</dd>
        </div>
        <div className="pc__row">
          <dt className="pc__lang-tag pc__lang-tag--de" aria-label="German">DE</dt>
          <dd className="pc__translation" lang="de">{phrase.de}</dd>
        </div>
        <div className="pc__row">
          <dt className="pc__lang-tag" aria-label="Persian">FA</dt>
          <dd className="pc__translation pc__translation--rtl" lang="fa" dir="rtl">
            {phrase.fa}
          </dd>
        </div>
      </dl>
    </article>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ClassroomPage() {
  const [activeId, setActiveId] = useState('greetings')
  const [query,    setQuery]    = useState('')
  const searchRef  = useRef<HTMLInputElement>(null)

  const activeCategory = CATEGORIES.find((c) => c.id === activeId)!

  // When a query exists, search across all categories on every field
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return ALL_PHRASES.filter(
      (p) =>
        p.latin.toLowerCase().includes(q)   ||
        p.arabic.includes(q)                ||
        p.en.toLowerCase().includes(q)      ||
        p.de.toLowerCase().includes(q)      ||
        p.fa.includes(q)                    ||
        (p.phonetic ?? '').toLowerCase().includes(q)
    )
  }, [query])

  const clearSearch = useCallback(() => {
    setQuery('')
    searchRef.current?.focus()
  }, [])

  const displayPhrases  = searchResults ?? activeCategory.phrases
  const totalCount      = displayPhrases.length
  const isSearching     = searchResults !== null

  return (
    <>
      <a href="#phrase-grid" className="skip-link">Skip to phrase cards</a>

      {/* ── Header ── */}
      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">
            Qashq<span>AI</span> Voice
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link" aria-current="page">Classroom</a>
            <a href="/record"    className="site-nav__link">Record</a>
            <a href="/about"     className="site-nav__link">About</a>
          </nav>
          <span className="site-badge">v0.3.0 · prototype</span>
        </div>
      </header>

      <main id="main-content">

        {/* ── Page hero ── */}
        <section className="hero hero--compact" aria-labelledby="classroom-heading">
          <div className="container">
            <a href="/" className="back-link">← Home</a>
            <h1 id="classroom-heading">
              Qashqai Classroom{' '}
              <em className="hero__beta">Beta</em>
            </h1>
            <p>
              Learn Qashqai words and phrases with translations in English, German, and Persian.
              Click <strong>▶</strong> to hear a pronunciation (Turkish voice, closest available).
            </p>
          </div>
        </section>

        {/* ── Search ── */}
        <div className="classroom-search-bar">
          <div className="container">
            <div className="search-wrap" role="search">
              <label htmlFor="phrase-search" className="sr-only">
                Search phrases
              </label>
              <span className="search-wrap__icon" aria-hidden="true">⌕</span>
              <input
                id="phrase-search"
                ref={searchRef}
                type="search"
                className="search-input"
                placeholder="Search in Qashqai, English, German, or Persian…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search all phrases"
              />
              {query && (
                <button
                  className="search-wrap__clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Tab bar (hidden during search) ── */}
        {!isSearching && (
          <div className="classroom-tabs-wrap">
            <div className="container">
              <div
                className="classroom-tabs"
                role="tablist"
                aria-label="Phrase categories"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    role="tab"
                    id={`tab-${cat.id}`}
                    aria-controls={`panel-${cat.id}`}
                    aria-selected={cat.id === activeId}
                    className={`classroom-tab${cat.id === activeId ? ' classroom-tab--active' : ''}`}
                    onClick={() => setActiveId(cat.id)}
                  >
                    <span aria-hidden="true">{cat.icon}</span>
                    <span className="classroom-tab__label">{cat.label}</span>
                    <span className="classroom-tab__count">{cat.phrases.length}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Phrase grid ── */}
        <section
          id={`panel-${activeId}`}
          role={!isSearching ? 'tabpanel' : undefined}
          aria-labelledby={!isSearching ? `tab-${activeId}` : undefined}
          className="section"
        >
          <div className="container">
            {/* Header row */}
            <div className="phrase-grid-header">
              {isSearching ? (
                <>
                  <h2 className="kilim-heading">
                    Search results
                  </h2>
                  <span className="phrase-count">
                    {totalCount} {totalCount === 1 ? 'phrase' : 'phrases'} found
                  </span>
                </>
              ) : (
                <>
                  <h2 className="kilim-heading">
                    <span aria-hidden="true">{activeCategory.icon} </span>
                    {activeCategory.label}
                  </h2>
                  <span className="phrase-count">{totalCount} phrases</span>
                </>
              )}
            </div>
            <div className="kilim-strip" aria-hidden="true" />

            {/* No results */}
            {totalCount === 0 && (
              <p className="phrase-empty" role="status">
                No phrases match <strong>"{query}"</strong>.{' '}
                <button className="phrase-empty__clear" onClick={clearSearch}>
                  Clear search
                </button>
              </p>
            )}

            {/* Cards */}
            <div
              id="phrase-grid"
              className="phrase-cards phrase-cards--wide"
              role="list"
              aria-label={isSearching ? 'Search results' : `${activeCategory.label} phrases`}
              aria-live="polite"
              aria-atomic="false"
            >
              {displayPhrases.map((phrase, i) => (
                <div key={`${'categoryId' in phrase ? phrase.categoryId : activeId}-${i}`} role="listitem">
                  <PhraseCard
                    phrase={phrase}
                    categoryLabel={
                      'categoryLabel' in phrase ? phrase.categoryLabel : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="footer-note">QashqAI Voice · v0.3.0 · Prototype</p>
          <p className="footer-note">
            Pronunciation uses browser TTS (Turkish voice). Native Qashqai audio is a future goal.
          </p>
        </div>
      </footer>
    </>
  )
}
