'use client'

import { useState, useMemo, useCallback } from 'react'

// ── Brand colours ────────────────────────────────────────────
const C = {
  navy:    '#1A2E44',
  navyDk:  '#111E2E',
  navyMd:  '#1F3650',
  teal:    '#0E7C7B',
  tealLt:  '#12A09F',
  gold:    '#C8952A',
  goldLt:  '#E0AA40',
  text:    '#F4EDD8',
  muted:   '#9E8E70',
  border:  '#263D58',
}

// Kilim-stripe gradient — reused in header/footer/card accents
const kilimStripe =
  `repeating-linear-gradient(90deg,` +
  `${C.gold} 0px,${C.gold} 6px,` +
  `${C.teal} 6px,${C.teal} 12px,` +
  `${C.navyDk} 12px,${C.navyDk} 20px,` +
  `${C.teal} 20px,${C.teal} 26px,` +
  `${C.gold} 26px,${C.gold} 32px)`

// ── Data types ───────────────────────────────────────────────
type Category =
  | 'animals' | 'food' | 'nature' | 'family' | 'tools'
  | 'weather' | 'emotions' | 'numbers' | 'colors' | 'body' | 'proverbs'

interface Word {
  qashqai:  string   // Arabic-script Qashqai with full vowel markings
  latin:    string   // Latin transliteration (used for speech)
  phonetic: string   // /IPA or readable phonetic/
  persian:  string
  german:   string
  english:  string
  category: Category
}

// ── Lexicon ──────────────────────────────────────────────────
const WORDS: Word[] = [
  // animals
  { qashqai: 'قۆیۇن', latin: 'qoyun', phonetic: '/qo.jun/', persian: 'گوسفند', german: 'Schaf',    english: 'sheep',  category: 'animals' },
  { qashqai: 'آت',    latin: 'at',    phonetic: '/at/',     persian: 'اسب',    german: 'Pferd',    english: 'horse',  category: 'animals' },
  { qashqai: 'ایت',   latin: 'it',    phonetic: '/it/',     persian: 'سگ',     german: 'Hund',     english: 'dog',    category: 'animals' },
  // nature
  { qashqai: 'سۇ',   latin: 'su',    phonetic: '/su/',     persian: 'آب',     german: 'Wasser',   english: 'water',  category: 'nature'  },
  { qashqai: 'اۆد',  latin: 'od',    phonetic: '/od/',     persian: 'آتش',    german: 'Feuer',    english: 'fire',   category: 'nature'  },
  { qashqai: 'آی',   latin: 'ay',    phonetic: '/aj/',     persian: 'ماه',    german: 'Mond',     english: 'moon',   category: 'nature'  },
  { qashqai: 'گۆن',  latin: 'gün',   phonetic: '/ɡyn/',    persian: 'خورشید', german: 'Sonne',    english: 'sun',    category: 'nature'  },
  // family
  { qashqai: 'آنا',  latin: 'ana',   phonetic: '/ˈa.na/', persian: 'مادر',   german: 'Mutter',   english: 'mother', category: 'family'  },
  { qashqai: 'آتا',  latin: 'ata',   phonetic: '/ˈa.ta/', persian: 'پدر',    german: 'Vater',    english: 'father', category: 'family'  },
  // food
  { qashqai: 'نان',  latin: 'nan',   phonetic: '/nan/',    persian: 'نان',    german: 'Brot',     english: 'bread',  category: 'food'    },
]

const ALL_CATEGORIES: Array<'all' | Category> = [
  'all', 'animals', 'food', 'nature', 'family',
  'tools', 'weather', 'emotions', 'numbers', 'colors', 'body', 'proverbs',
]

// ── Page ─────────────────────────────────────────────────────
export default function DictionaryPage() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState<'all' | Category>('all')
  const [speaking, setSpeaking] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return WORDS.filter(w => {
      const inCat = category === 'all' || w.category === category
      if (!q) return inCat
      return inCat && (
        w.latin.toLowerCase().includes(q)   ||
        w.qashqai.includes(q)               ||
        w.persian.includes(q)               ||
        w.german.toLowerCase().includes(q)  ||
        w.english.toLowerCase().includes(q)
      )
    })
  }, [query, category])

  const speak = useCallback((word: Word) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(word.latin)
    u.lang  = 'tr-TR'
    u.rate  = 0.75
    u.pitch = 1.0
    setSpeaking(word.latin)
    u.onend  = () => setSpeaking(null)
    u.onerror = () => setSpeaking(null)
    window.speechSynthesis.speak(u)
  }, [])

  return (
    <div style={{ background: C.navy, color: C.text, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', lineHeight: 1.6, display: 'flex', flexDirection: 'column' }}>

      {/* ── Kilim top bar ── */}
      <div style={{ height: '7px', background: kilimStripe }} />

      {/* ── Header ── */}
      <header style={{ borderBottom: `1px solid ${C.border}`, paddingBlock: '1rem' }}>
        <div style={{ maxWidth: '1000px', marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/" style={{ fontSize: '1.15rem', fontWeight: 800, color: C.text, textDecoration: 'none', letterSpacing: '-0.02em', flexShrink: 0 }}>
            Qashq<span style={{ color: C.gold }}>AI</span> Voice
          </a>
          <span style={{ fontSize: '0.75rem', color: C.gold, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Living Dictionary
          </span>
          <nav style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
            <a href="/"          style={{ fontSize: '0.875rem', color: C.muted, textDecoration: 'none', fontWeight: 600 }}>Home</a>
            <a href="/classroom" style={{ fontSize: '0.875rem', color: C.muted, textDecoration: 'none', fontWeight: 600 }}>Classroom</a>
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: '1000px', marginInline: 'auto', width: '100%', paddingInline: '1.5rem', paddingBlock: '2.5rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.5rem' }}>
            Darreh-Shuri Dialect · Turkic / Oghuz
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Living Dictionary
          </h1>
          {/* kilim divider */}
          <div style={{ width: '120px', height: '4px', background: kilimStripe, marginInline: 'auto', borderRadius: '2px', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1rem', color: C.muted, maxWidth: '540px', marginInline: 'auto', lineHeight: 1.7 }}>
            A growing lexicon of the Qashqai language — critically endangered. Vowel markings{' '}
            <span style={{ color: C.gold }}>ۆ ۉ ۊ ۋ ۇ</span> are faithfully preserved in every entry.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: '1.1rem', pointerEvents: 'none', userSelect: 'none' }}>
            ◎
          </span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search in Qashqai · Persian · German · English…"
            style={{ width: '100%', padding: '0.9rem 1rem 0.9rem 2.75rem', background: C.navyDk, color: C.text, border: `1px solid ${C.border}`, borderRadius: '0.75rem', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {ALL_CATEGORIES.map(cat => {
            const active = category === cat
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ padding: '0.3rem 0.875rem', borderRadius: '9999px', border: `1px solid ${active ? C.gold : C.border}`, background: active ? C.gold : 'transparent', color: active ? C.navyDk : C.muted, fontWeight: active ? 700 : 500, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 150ms' }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Count */}
        <p style={{ fontSize: '0.8rem', color: C.muted, marginBottom: '1.25rem' }}>
          {filtered.length} {filtered.length === 1 ? 'word' : 'words'}
          {category !== 'all' && ` · ${category}`}
          {query && ` · matching "${query}"`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
            {filtered.map(word => (
              <WordCard
                key={word.latin}
                word={word}
                isSpeaking={speaking === word.latin}
                onSpeak={speak}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingBlock: '5rem', color: C.muted }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '0.2em' }}>◇ ◆ ◇</p>
            <p style={{ fontSize: '1rem' }}>No words found.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.4rem' }}>Try a different search or select <strong>all</strong> categories.</p>
          </div>
        )}

        {/* Contribute notice */}
        <div style={{ marginTop: '3rem', padding: '1.25rem 1.5rem', background: C.navyDk, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.teal}`, borderRadius: '0.75rem', fontSize: '0.875rem', color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.text }}>This dictionary is growing.</strong> Entries are being added with community consent and cultural review. Qashqai orthography follows the Darreh-Shuri convention. Audio uses the Web Speech API (tr-TR voice as the closest available approximation).
        </div>

      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, paddingBlock: '1.5rem' }}>
        <div style={{ maxWidth: '1000px', marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: C.muted }}>
            Qashq<span style={{ color: C.gold }}>AI</span> Voice · Living Dictionary · v0.4.0
          </p>
          <p style={{ fontSize: '0.8rem', color: C.muted }}>
            Vowel markings: Darreh-Shuri convention · Audio: Web Speech API tr-TR
          </p>
        </div>
      </footer>

      {/* ── Kilim bottom bar ── */}
      <div style={{ height: '7px', background: kilimStripe }} />

    </div>
  )
}

// ── Word card ────────────────────────────────────────────────
function WordCard({
  word,
  isSpeaking,
  onSpeak,
}: {
  word: Word
  isSpeaking: boolean
  onSpeak: (w: Word) => void
}) {
  return (
    <article
      style={{ background: C.navyDk, border: `1px solid ${C.border}`, borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 200ms' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = C.teal)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
    >
      {/* Card top: category + speaker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingInline: '1.25rem', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.teal }}>
          {word.category}
        </span>
        <button
          onClick={() => onSpeak(word)}
          aria-label={`Pronounce "${word.english}" in Qashqai`}
          title="Play pronunciation (Web Speech API · tr-TR)"
          style={{ width: '2.1rem', height: '2.1rem', borderRadius: '50%', border: `1px solid ${isSpeaking ? C.gold : C.border}`, background: isSpeaking ? C.gold : C.navyMd, color: isSpeaking ? C.navyDk : C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0, transition: 'all 150ms' }}
        >
          {isSpeaking ? '▶' : '♪'}
        </button>
      </div>

      {/* Qashqai word + phonetic */}
      <div style={{ paddingInline: '1.25rem', paddingBlock: '0.75rem 0.875rem', borderBottom: `1px solid ${C.border}` }}>
        <p
          lang="az"
          dir="rtl"
          style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.35rem', textAlign: 'right', color: C.text }}
        >
          {word.qashqai}
        </p>
        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: C.gold, marginBottom: '0.1rem' }}>
          {word.latin}
        </p>
        <p style={{ fontSize: '0.85rem', color: C.muted, fontStyle: 'italic', letterSpacing: '0.02em' }}>
          {word.phonetic}
        </p>
      </div>

      {/* Translations */}
      <div style={{ paddingInline: '1.25rem', paddingBlock: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {([
          { flag: 'فا', text: word.persian, rtl: true  },
          { flag: 'DE', text: word.german,  rtl: false },
          { flag: 'EN', text: word.english, rtl: false },
        ] as const).map(t => (
          <div key={t.flag} style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.teal, width: '1.6rem', flexShrink: 0, letterSpacing: '0.04em' }}>
              {t.flag}
            </span>
            <span dir={t.rtl ? 'rtl' : 'ltr'} style={{ fontSize: '0.95rem', color: C.text }}>
              {t.text}
            </span>
          </div>
        ))}
      </div>

      {/* Kilim card foot accent */}
      <div style={{ height: '3px', background: kilimStripe }} />
    </article>
  )
}
