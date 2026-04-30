'use client'

import MetadataForm from '../../components/MetadataForm'

const T = {
  bg:      '#160D07',
  surface: '#251408',
  border:  '#5A3318',
  text:    '#F6EAD8',
  muted:   '#C8A880',
  tc:      '#C24E1C',
  tcLight: '#DE7038',
  tcDim:   '#2E1208',
}

export default function ContributePage() {
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', lineHeight: 1.6, minHeight: '100vh' }}>

      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${T.border}`, paddingBlock: '1rem', position: 'sticky', top: 0, background: T.bg, zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/" aria-label="QashqAI Voice home" style={{ fontSize: '1.2rem', fontWeight: 800, color: T.text, textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Qashq<span style={{ color: T.tc }}>AI</span> Voice
          </a>
          <nav aria-label="Main navigation" style={{ display: 'flex', gap: '1.25rem', marginLeft: 'auto', alignItems: 'center' }}>
            <a href="/"           style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Home</a>
            <a href="/classroom"  style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Classroom</a>
            <a href="/dictionary" style={{ fontSize: '0.875rem', fontWeight: 600, color: T.muted, textDecoration: 'none' }}>Dictionary</a>
            <a href="/contribute" style={{ fontSize: '0.875rem', fontWeight: 600, color: T.tcLight, textDecoration: 'none' }}>Contribute</a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section aria-labelledby="contribute-heading" style={{ paddingBlock: '3rem' }}>
          <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.tc, marginBottom: '0.75rem' }}>
              Data Governance
            </p>
            <h1 id="contribute-heading" style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Linguistic Item Entry
            </h1>
            <p style={{ fontSize: '1rem', color: T.muted, marginBottom: '2rem', lineHeight: 1.7 }}>
              Record metadata and consent status for a linguistic item. Every field marked with * is required.
              Items with pending or archive-only consent cannot be made public.
            </p>

            <MetadataForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, paddingBlock: '2.5rem', marginTop: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '900px', marginInline: 'auto', paddingInline: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              Qashq<span style={{ color: T.tc }}>AI</span> Voice
            </p>
            <p style={{ fontSize: '0.8rem', color: T.muted }}>
              A cultural-technological initiative for endangered language preservation.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: T.muted }}>v0.4.0</p>
            <p style={{ fontSize: '0.8rem', color: T.muted }}>Consent before data</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
