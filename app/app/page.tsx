'use client'

// QashqAI Voice — Landing page
// Warm Terracotta / Qashqai theme, inline styles

const T = {
  bg:      '#160D07',
  surface: '#251408',
  surf2:   '#381D0E',
  border:  '#5A3318',
  text:    '#F6EAD8',
  muted:   '#C8A880',
  tc:      '#C24E1C',   // terracotta
  tcLight: '#DE7038',
  tcDim:   '#2E1208',   // terracotta tint for backgrounds
  gold:    '#D4A44A',
}

export default function Home() {
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', lineHeight: 1.6, minHeight: '100vh' }}>

      {/* Skip link (reuses existing .skip-link class) */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Header ──────────────────────────────────────────── */}
      <header style={{ borderBottom: `1px solid ${T.border}`, paddingBlock: '1rem', position: 'sticky', top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" aria-label="QashqAI Voice home" style={{ fontSize: '1.2rem', fontWeight: 800, color: T.text, textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Qashq<span style={{ color: T.tc }}>AI</span> Voice
          </a>
          <nav aria-label="Main navigation" style={{ display: 'flex', gap: '1.25rem', marginLeft: 'auto', alignItems: 'center' }}>
            <a href="#pipeline"   style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Pipeline</a>
            <a href="#classroom"  style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Classroom</a>
            <a href="#ethics"     style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Ethics</a>
            <a href="#milestones" style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Milestones</a>
          </nav>
          <span aria-label="Version 0.4.0 prototype" style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: T.surf2, color: T.muted, border: `1px solid ${T.border}`, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            v0.4.0 · prototype
          </span>
        </div>
      </header>

      <main id="main-content">

        {/* ── Hero ────────────────────────────────────────────── */}
        <section aria-labelledby="hero-heading" style={{ paddingBlock: '5rem 4rem', textAlign: 'center', background: `radial-gradient(ellipse at top center, ${T.tcDim} 0%, transparent 65%)` }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '1rem' }}>
              Cultural · Technological · Ethical
            </p>
            <h1 id="hero-heading" style={{ fontSize: 'clamp(1.875rem, 6vw, 3rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Giving a digital future to{' '}
              <em style={{ fontStyle: 'normal', color: T.tcLight }}>voices that history ignored</em>
            </h1>
            <p style={{ fontSize: '1.125rem', color: T.muted, maxWidth: '600px', marginInline: 'auto', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              QashqAI Voice preserves the Qashqai language — an endangered Turkic language spoken by nomadic communities in Iran — through ethical, community-centred artificial intelligence powered by Claude.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/classroom" style={{ padding: '0.75rem 2rem', background: T.tc, color: '#fff', fontWeight: 700, borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.95rem' }}>
                Open Classroom
              </a>
              <a href="#pipeline" style={{ padding: '0.75rem 2rem', background: 'transparent', color: T.text, fontWeight: 600, borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.95rem', border: `1px solid ${T.border}` }}>
                How It Works
              </a>
            </div>
          </div>
        </section>

        {/* ── Supported Languages ─────────────────────────────── */}
        <section aria-labelledby="langs-heading" style={{ paddingBlock: '3rem', borderTop: `1px solid ${T.border}` }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '0.75rem' }}>
              Supported languages
            </p>
            <h2 id="langs-heading" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
              Four voices, one platform
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }} role="list">
              {([
                { script: 'قاشقایی', name: 'Qashqai', lang: 'az', accent: true },
                { script: 'فارسی',   name: 'Persian',  lang: 'fa', accent: false },
                { script: 'Türkçe', name: 'Turkish',  lang: 'tr', accent: false },
                { script: 'English', name: 'English',  lang: 'en', accent: false },
              ] as const).map(l => (
                <div key={l.name} role="listitem" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem 1rem', minWidth: '120px', background: l.accent ? T.tcDim : T.surface, border: `1px solid ${l.accent ? T.tc : T.border}`, borderRadius: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600 }} lang={l.lang}>{l.script}</span>
                  <span style={{ fontSize: '0.65rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Three-Agent Pipeline ─────────────────────────────── */}
        <section id="pipeline" aria-labelledby="pipeline-heading" style={{ paddingBlock: '3rem', borderTop: `1px solid ${T.border}` }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '0.75rem' }}>
              How it works
            </p>
            <h2 id="pipeline-heading" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
              Three-agent pipeline
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }} role="list">

              <div role="listitem" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.5rem', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: T.tc, marginBottom: '0.5rem' }}>01</p>
                <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Language Detector</p>
                <p style={{ fontSize: '0.875rem', color: T.muted, lineHeight: 1.6 }}>
                  Identifies Qashqai, Persian, Turkish, or English using Unicode script heuristics — no ML dependencies, instant and offline-capable.
                </p>
              </div>

              <span aria-hidden="true" style={{ fontSize: '1.25rem', color: T.muted, flexShrink: 0, marginTop: '2rem' }}>→</span>

              <div role="listitem" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.5rem', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: T.tc, marginBottom: '0.5rem' }}>02</p>
                <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Cultural Guardian</p>
                <p style={{ fontSize: '0.875rem', color: T.muted, lineHeight: 1.6 }}>
                  Validates every message for cultural safety and respectfulness before any LLM processing. Community-defined rules protect heritage values.
                </p>
              </div>

              <span aria-hidden="true" style={{ fontSize: '1.25rem', color: T.muted, flexShrink: 0, marginTop: '2rem' }}>→</span>

              <div role="listitem" style={{ flex: 1, minWidth: '180px', padding: '1rem 1.5rem', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '0.75rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: T.tc, marginBottom: '0.5rem' }}>03</p>
                <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>Reasoning Agent</p>
                <p style={{ fontSize: '0.875rem', color: T.muted, lineHeight: 1.6 }}>
                  Powered by Claude with adaptive extended thinking. Generates language-aware responses tailored to the detected or selected language.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Classroom v0.4.0 ─────────────────────────────────── */}
        <section id="classroom" aria-labelledby="classroom-heading" style={{ paddingBlock: '3rem', borderTop: `1px solid ${T.border}` }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '0.75rem' }}>
              Classroom
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h2 id="classroom-heading" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Interactive Language Classroom
              </h2>
              <span aria-label="Version 0.4.0" style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: T.tcDim, color: T.tcLight, border: `1px solid ${T.tc}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                v0.4.0
              </span>
            </div>
            <p style={{ fontSize: '1rem', color: T.muted, marginBottom: '2rem', lineHeight: 1.7 }}>
              A structured environment for learning Qashqai through community-verified phrase cards, bilingual translations, and AI-powered conversational practice — with full RTL script support.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { title: 'Phrase Cards',    desc: 'Curated vocabulary with Qashqai, English, and Persian translations displayed side by side.' },
                { title: 'AI Conversation', desc: 'Practice Qashqai with a culturally-aware AI that responds in the language you choose.' },
                { title: 'RTL Script',      desc: 'Full right-to-left rendering for Qashqai Arabic script alongside Latin-script language pairs.' },
                { title: 'Cultural Safety', desc: 'Every interaction passes through the Cultural Guardian before reaching the language model.' },
              ].map(f => (
                <div key={f.title} style={{ padding: '1rem 1.25rem', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '0.75rem' }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.95rem' }}>{f.title}</p>
                  <p style={{ fontSize: '0.875rem', color: T.muted, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <a href="/classroom" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: T.tc, color: '#fff', fontWeight: 700, borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.95rem' }}>
              Enter Classroom
            </a>
          </div>
        </section>

        {/* ── Ethical Framework ────────────────────────────────── */}
        <section id="ethics" aria-labelledby="ethics-heading" style={{ paddingBlock: '3rem', borderTop: `1px solid ${T.border}` }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '0.75rem' }}>
              Principles
            </p>
            <h2 id="ethics-heading" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Ethical Framework
            </h2>
            <p style={{ fontSize: '1rem', color: T.muted, marginBottom: '2rem', lineHeight: 1.7 }}>
              Five non-negotiable commitments that govern every aspect of QashqAI Voice — from data collection to AI response generation. Technology serves the community; never the reverse.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { n: '1', title: 'Consent before data',              body: 'No voice recording, data collection, or processing proceeds without confirmed, documented community consent.' },
                { n: '2', title: 'Guardian before model',            body: 'Cultural Guardian review is mandatory before any content reaches the language model. No exceptions.' },
                { n: '3', title: 'Restricted data stays restricted', body: 'Tier 2 sensitive content remains in controlled storage and is never shared without explicit community approval.' },
                { n: '4', title: 'Dialect is not error',             body: 'Variation in Qashqai speech is preserved faithfully. We never "correct" the language to conform to another standard.' },
                { n: '5', title: 'Cultural integrity is the mission',body: "The community's cultural integrity is the purpose of this project — not a constraint on it. All content is strictly cultural and educational; never political." },
              ].map(p => (
                <div key={p.n} style={{ display: 'flex', gap: '1rem', padding: '1rem 1.25rem', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '0.75rem', alignItems: 'flex-start' }}>
                  <span aria-hidden="true" style={{ fontSize: '0.7rem', fontWeight: 700, color: T.tc, background: T.tcDim, border: `1px solid ${T.tc}`, borderRadius: '50%', width: '1.75rem', height: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.n}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.title}</p>
                    <p style={{ fontSize: '0.875rem', color: T.muted, lineHeight: 1.6 }}>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Milestones ──────────────────────────────────────── */}
        <section id="milestones" aria-labelledby="milestones-heading" style={{ paddingBlock: '3rem', borderTop: `1px solid ${T.border}` }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '0.75rem' }}>
              Progress
            </p>
            <h2 id="milestones-heading" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
              Milestones
            </h2>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { date: 'April 2026',  body: 'Community Consent Framework v1.0 published — the foundational governance document for all data collection and speaker engagement.' },
                { date: 'April 2026',  body: 'LDA 2026 Berlin abstract accepted (submission ID: 713903) — QashqAI Voice to be presented at the Language Documentation & Archiving Conference.' },
                { date: 'April 2026',  body: 'Multilingual content strategy launched: 2 posts/day across Qashqai, Persian, Turkish, and English on 3 platforms.' },
                { date: 'April 2026',  body: 'Pitch deck v2 prepared for Code with Claude London — 13 slides, including a new "Why Now" slide on the AI–endangered language convergence.' },
                { date: '19 May 2026', body: 'Code with Claude London — live presentation and interactive demo of the QashqAI Voice platform.', upcoming: true },
              ].map((m, i, arr) => (
                <li key={i} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.upcoming ? T.gold : T.tc, marginTop: '5px', flexShrink: 0, border: `2px solid ${m.upcoming ? T.gold : T.tc}` }} />
                    {i < arr.length - 1 && <div style={{ width: '2px', flex: 1, background: T.border, minHeight: '1.5rem' }} />}
                  </div>
                  <div style={{ paddingBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: m.upcoming ? T.gold : T.tc, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
                      {m.date}{m.upcoming ? ' · Upcoming' : ''}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: T.muted, lineHeight: 1.6 }}>{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, paddingBlock: '2.5rem', marginTop: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              Qashq<span style={{ color: T.tc }}>AI</span> Voice
            </p>
            <p style={{ fontSize: '0.8rem', color: T.muted }}>
              A cultural–technological initiative for endangered language preservation.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: T.muted }}>v0.4.0 · Prototype</p>
            <p style={{ fontSize: '0.8rem', color: T.muted }}>Built with ethical AI principles · Qashqai first</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
