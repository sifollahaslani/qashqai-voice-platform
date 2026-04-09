'use client'

import { useState } from 'react'

const CARD_COLORS = [
  { bg: '#1a1f3a', accent: '#6c8eff', border: '#2d3561' },
  { bg: '#1a2e1f', accent: '#4ecb71', border: '#2a4a30' },
  { bg: '#2e1a2a', accent: '#e06cff', border: '#4a2a45' },
  { bg: '#2e2010', accent: '#ff9f43', border: '#4a3318' },
  { bg: '#101e2e', accent: '#43c6ff', border: '#183048' },
  { bg: '#2e1a1a', accent: '#ff6b6b', border: '#4a2a2a' },
  { bg: '#1a2a2e', accent: '#43ffd9', border: '#2a4048' },
  { bg: '#28221a', accent: '#ffd343', border: '#443620' },
  { bg: '#1e1a2e', accent: '#a78bfa', border: '#342a4a' },
  { bg: '#1a2820', accent: '#6effa0', border: '#2a4030' },
]

interface CardData {
  num: string
  emoji: string
  titleEn: string
  titleFa: string
  tips: string[]
  relevance: {
    languageDetector: string
    culturalGuardian: string
    reasoningAgent: string
  }
}

const CARDS: CardData[] = [
  {
    num: '01',
    emoji: '🎯',
    titleEn: 'Prompt Engineering',
    titleFa: 'مهندسی پرامپت',
    tips: [
      'Be explicit about format, tone, and length in every instruction.',
      'Use delimiters (XML tags, triple backticks) to isolate input sections.',
      'State constraints before the task, not after — LLMs front-load attention.',
    ],
    relevance: {
      languageDetector: 'The detector prompt explicitly names each script family and lists distinguishing Unicode codepoints (e.g. ۆۉۊۋ) — a direct application of constraint-first prompting.',
      culturalGuardian: 'Guardian instructions are scoped by XML-style role tags so the model knows it is a safety validator, not a responder — format clarity prevents role confusion.',
      reasoningAgent: 'Four language-specific system prompts are selected at runtime, each precisely scoped to cultural register, response language, and community values.',
    },
  },
  {
    num: '02',
    emoji: '🔗',
    titleEn: 'Chain of Thought',
    titleFa: 'زنجیره تفکر',
    tips: [
      'Ask the model to "think step by step" before giving a final answer.',
      'For complex tasks, prompt for intermediate reasoning in a scratchpad block.',
      'Verify intermediate conclusions before consuming the final output.',
    ],
    relevance: {
      languageDetector: 'Unicode script analysis follows a decision chain: Arabic script? → Qashqai markers? → Qashqai. Each branch is an explicit reasoning step, not a black-box lookup.',
      culturalGuardian: 'The guardian is designed to be extended with sequential checks (empty → offensive → culturally sensitive), mirroring a CoT safety ladder.',
      reasoningAgent: 'Claude is invoked with adaptive thinking enabled — the model generates an internal scratchpad before producing the user-visible reply.',
    },
  },
  {
    num: '03',
    emoji: '🧩',
    titleEn: 'Retrieval-Augmented Generation',
    titleFa: 'تولید با بازیابی اطلاعات',
    tips: [
      'Retrieve only the top-k most relevant chunks, not entire documents.',
      'Include source metadata alongside chunks so the model can cite provenance.',
      'Re-rank retrieved chunks by query relevance before injecting into context.',
    ],
    relevance: {
      languageDetector: 'A future upgrade can retrieve community-curated Qashqai vocabulary lists at inference time, making detection data-driven rather than hard-coded.',
      culturalGuardian: 'Community safety rules stored in a vector DB can be retrieved per query, allowing the guardian to cite which specific cultural norm a message may violate.',
      reasoningAgent: 'Qashqai oral literature, proverbs, and clan histories can be retrieved and injected as grounding context before Claude generates a response.',
    },
  },
  {
    num: '04',
    emoji: '🌡️',
    titleEn: 'Temperature & Sampling',
    titleFa: 'تنظیم دما و نمونه‌برداری',
    tips: [
      'Use low temperature (0–0.3) for factual, deterministic tasks like classification.',
      'Use higher temperature (0.7–1.0) for creative or conversational generation.',
      'Combine temperature with top-p nucleus sampling for fine-grained control.',
    ],
    relevance: {
      languageDetector: 'Detection is deterministic — temperature is effectively 0; the heuristic always returns the same label for the same input.',
      culturalGuardian: 'Safety classification should use low temperature to avoid probabilistic drift into unsafe "maybe" decisions that could pass harmful content.',
      reasoningAgent: 'Conversational replies benefit from moderate temperature; cultural explanations or translations should be kept lower to preserve accuracy.',
    },
  },
  {
    num: '05',
    emoji: '💬',
    titleEn: 'Few-Shot Learning',
    titleFa: 'یادگیری با نمونه‌های اندک',
    tips: [
      'Provide 3–5 diverse, representative examples that cover edge cases.',
      'Format examples identically to the expected input/output structure.',
      'Place examples closest to the task instruction to maximise attention.',
    ],
    relevance: {
      languageDetector: 'Embedding two Qashqai example phrases (input → "qashqai") in the detection prompt can raise confidence on rare script combinations.',
      culturalGuardian: 'One example of a culturally respectful message and one borderline case helps the model calibrate the pass/fail threshold for Qashqai norms.',
      reasoningAgent: 'Sample Qashqai conversation turns injected before the user message teach the model the expected register, vocabulary, and politeness level.',
    },
  },
  {
    num: '06',
    emoji: '🔄',
    titleEn: 'Prompt Chaining',
    titleFa: 'زنجیره‌سازی پرامپت',
    tips: [
      'Break complex tasks into sequential prompts where each output feeds the next.',
      'Validate each step\'s output format before passing it downstream.',
      'Keep individual prompts narrow — one responsibility per prompt.',
    ],
    relevance: {
      languageDetector: 'The detector is step 1 of a three-prompt chain; its "language" output is passed verbatim to the guardian\'s next call.',
      culturalGuardian: 'Step 2 receives the detected language and original text; it emits a pass/fail that gates whether step 3 ever runs.',
      reasoningAgent: 'Step 3 receives both the detected language and the culturally validated text — it cannot run without upstream outputs, enforcing pipeline integrity.',
    },
  },
  {
    num: '07',
    emoji: '🛡️',
    titleEn: 'System Prompt Design',
    titleFa: 'طراحی پرامپت سیستمی',
    tips: [
      'Assign a specific persona and scope; avoid vague "helpful assistant" roles.',
      'List explicit prohibitions (what NOT to do) alongside capabilities.',
      'Version-control system prompts alongside code — they are part of your product.',
    ],
    relevance: {
      languageDetector: 'No system prompt is used — the heuristic runs in Python, not via LLM. This is intentional: reserve system prompts for tasks that genuinely need them.',
      culturalGuardian: 'The guardian system prompt defines it as a "Qashqai cultural safety reviewer" with a strict pass/fail output schema — scope is narrow by design.',
      reasoningAgent: 'Four distinct system prompts are version-controlled in main.py, each encoding community-specific values (Qashqai identity, Persian cultural awareness, etc.).',
    },
  },
  {
    num: '08',
    emoji: '🧠',
    titleEn: 'Extended Thinking',
    titleFa: 'تفکر عمیق',
    tips: [
      'Enable extended thinking for multi-step reasoning tasks, not simple lookups.',
      'Set a thinking budget proportional to task complexity to manage latency.',
      'Parse thinking blocks separately from final output in your application logic.',
    ],
    relevance: {
      languageDetector: 'Extended thinking is disabled here — Unicode pattern matching does not benefit from deliberation; speed matters more.',
      culturalGuardian: 'Could use a small thinking budget when evaluating ambiguous edge-cases that sit on the cultural safety boundary.',
      reasoningAgent: 'Uses {"type": "adaptive"} thinking — Claude auto-scales deliberation depth for complex Qashqai language queries before composing its reply.',
    },
  },
  {
    num: '09',
    emoji: '🔍',
    titleEn: 'Structured Output',
    titleFa: 'خروجی ساختاریافته',
    tips: [
      'Request JSON or XML with an explicit schema in the prompt.',
      'Validate the response against a Pydantic or Zod schema before using it.',
      'Provide a fallback extraction strategy for when the model goes off-schema.',
    ],
    relevance: {
      languageDetector: 'Returns {"language": "...", "confidence": "..."} — a strict JSON contract validated by Pydantic before it enters the pipeline.',
      culturalGuardian: 'Expected to emit a structured verdict (pass/fail + reason) so the orchestrator can branch deterministically without parsing prose.',
      reasoningAgent: 'The /chat endpoint response schema (detected_language, steps[], final) is Pydantic-validated — callers always receive a predictable shape.',
    },
  },
  {
    num: '10',
    emoji: '🚀',
    titleEn: 'Agent Pipelines',
    titleFa: 'خطوط لوله عاملی',
    tips: [
      'Give each agent a single, well-scoped responsibility to enable independent testing.',
      'Use an orchestrator to manage state, routing, and error recovery between agents.',
      'Log each agent\'s input and output for observability and debugging.',
    ],
    relevance: {
      languageDetector: 'Agent 1 — isolated, stateless, heuristic-based. Can be swapped for an ML model without touching downstream agents.',
      culturalGuardian: 'Agent 2 — acts as a circuit-breaker. If it raises an exception, OrchestratorAgent surfaces the error without ever reaching the LLM.',
      reasoningAgent: 'Agent 3 — only runs after the first two agents validate the request. The orchestrator pattern means each agent can be upgraded independently.',
    },
  },
]

export default function OptimizationPage() {
  const [showRelevance, setShowRelevance] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  function toggleCard(index: number) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#0d0d14',
    color: '#e8e8f0',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    lineHeight: 1.6,
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  }

  const headerStyle: React.CSSProperties = {
    borderBottom: '1px solid #1e1e30',
    padding: '20px 0',
    marginBottom: '0',
    background: 'linear-gradient(180deg, #0a0a12 0%, #0d0d14 100%)',
  }

  const headerInnerStyle: React.CSSProperties = {
    ...containerStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '12px',
  }

  const logoStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#e8e8f0',
    textDecoration: 'none',
    letterSpacing: '-0.02em',
  }

  const logoAccentStyle: React.CSSProperties = {
    color: '#6c8eff',
  }

  const badgeStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: '#6c8eff',
    background: 'rgba(108,142,255,0.12)',
    border: '1px solid rgba(108,142,255,0.3)',
    borderRadius: '20px',
    padding: '4px 14px',
  }

  const heroStyle: React.CSSProperties = {
    padding: '64px 20px 48px',
    textAlign: 'center' as const,
    maxWidth: '1200px',
    margin: '0 auto',
  }

  const h1Style: React.CSSProperties = {
    fontSize: 'clamp(1.8rem, 5vw, 3rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    margin: '0 0 12px',
    lineHeight: 1.2,
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.05rem',
    color: '#8888aa',
    margin: '0 0 32px',
    direction: 'rtl' as const,
  }

  const toggleBtnStyle: React.CSSProperties = {
    background: showRelevance ? 'rgba(108,142,255,0.15)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${showRelevance ? 'rgba(108,142,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '8px',
    color: showRelevance ? '#6c8eff' : '#8888aa',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    padding: '10px 20px',
    transition: 'all 0.2s',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    padding: '0 20px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
  }

  const footerStyle: React.CSSProperties = {
    borderTop: '1px solid #1e1e30',
    padding: '28px 20px',
    textAlign: 'center' as const,
    color: '#555570',
    fontSize: '0.875rem',
  }

  const footerLinkStyle: React.CSSProperties = {
    color: '#6c8eff',
    textDecoration: 'none',
    fontWeight: 600,
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <a href="/" style={logoStyle}>
            Qashq<span style={logoAccentStyle}>AI</span> Voice
          </a>
          <span style={badgeStyle}>QashqAI Voice · AI Strategy</span>
        </div>
      </header>

      {/* Hero */}
      <section style={heroStyle}>
        <h1 style={h1Style}>
          LLM{' '}
          <span style={{ color: '#6c8eff' }}>Optimization</span>{' '}
          Guide
        </h1>
        <p style={subtitleStyle}>راهنمای بهینه‌سازی مدل‌های زبانی بزرگ</p>
        <p style={{ color: '#8888aa', margin: '0 0 28px', fontSize: '0.95rem' }}>
          10 techniques every AI engineer should master — with examples from the QashqAI Voice pipeline.
        </p>
        <button
          style={toggleBtnStyle}
          onClick={() => setShowRelevance(v => !v)}
          aria-pressed={showRelevance}
        >
          {showRelevance ? '🔭 Hide' : '🔭 Show'} QashqAI Relevance
        </button>
      </section>

      {/* Cards Grid */}
      <div style={gridStyle}>
        {CARDS.map((card, i) => {
          const color = CARD_COLORS[i]
          const isExpanded = expandedCards.has(i)

          const cardStyle: React.CSSProperties = {
            background: color.bg,
            border: `1px solid ${color.border}`,
            borderRadius: '14px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
            position: 'relative' as const,
            overflow: 'hidden',
          }

          const numStyle: React.CSSProperties = {
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: color.accent,
            marginBottom: '8px',
            display: 'block',
          }

          const emojiStyle: React.CSSProperties = {
            fontSize: '2rem',
            display: 'block',
            marginBottom: '10px',
            lineHeight: 1,
          }

          const titleEnStyle: React.CSSProperties = {
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#f0f0f8',
            margin: '0 0 4px',
          }

          const titleFaStyle: React.CSSProperties = {
            fontSize: '0.95rem',
            color: color.accent,
            margin: '0 0 16px',
            direction: 'rtl' as const,
            fontWeight: 500,
          }

          const dividerStyle: React.CSSProperties = {
            height: '1px',
            background: color.border,
            margin: '16px 0',
          }

          const tipListStyle: React.CSSProperties = {
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '8px',
          }

          const tipItemStyle: React.CSSProperties = {
            fontSize: '0.85rem',
            color: '#b0b0c8',
            paddingLeft: '16px',
            position: 'relative' as const,
          }

          const chevronStyle: React.CSSProperties = {
            position: 'absolute' as const,
            top: '16px',
            right: '20px',
            color: color.accent,
            fontSize: '0.75rem',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            opacity: 0.7,
          }

          const relevanceSectionStyle: React.CSSProperties = {
            marginTop: '16px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.25)',
            border: `1px solid ${color.border}`,
            overflow: 'hidden',
          }

          const relevanceHeaderStyle: React.CSSProperties = {
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: color.accent,
            padding: '10px 14px 0',
            marginBottom: '8px',
          }

          const agentRowStyle: React.CSSProperties = {
            padding: '8px 14px',
            borderTop: `1px solid ${color.border}`,
          }

          const agentLabelStyle: React.CSSProperties = {
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            color: color.accent,
            marginBottom: '3px',
            display: 'block',
            opacity: 0.8,
          }

          const agentTextStyle: React.CSSProperties = {
            fontSize: '0.82rem',
            color: '#9090b0',
            lineHeight: 1.5,
          }

          return (
            <article
              key={i}
              style={cardStyle}
              onClick={() => toggleCard(i)}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
              role="button"
              aria-expanded={isExpanded}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleCard(i)}
            >
              <span style={chevronStyle}>▼</span>
              <span style={numStyle}>{card.num}</span>
              <span style={emojiStyle}>{card.emoji}</span>
              <h2 style={titleEnStyle}>{card.titleEn}</h2>
              <p style={titleFaStyle}>{card.titleFa}</p>

              <div style={dividerStyle} />

              <ul style={tipListStyle}>
                {card.tips.map((tip, ti) => (
                  <li key={ti} style={tipItemStyle}>
                    <span style={{ position: 'absolute', left: 0, color: color.accent }}>›</span>
                    {tip}
                  </li>
                ))}
              </ul>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ marginTop: '16px' }}>
                  <div style={dividerStyle} />
                  <p style={{ fontSize: '0.72rem', color: '#555570', margin: '0 0 8px', fontStyle: 'italic' }}>
                    Clicked to expand ↓
                  </p>
                  <div style={{ fontSize: '0.82rem', color: '#9090b0', lineHeight: 1.6 }}>
                    <strong style={{ color: '#c0c0d8' }}>Deep dive:</strong> Mastering {card.titleEn.toLowerCase()} enables more reliable, efficient, and maintainable LLM-powered systems. Apply these techniques iteratively — measure output quality before and after each change.
                  </div>
                </div>
              )}

              {/* QashqAI Relevance */}
              {showRelevance && (
                <div
                  style={relevanceSectionStyle}
                  onClick={e => e.stopPropagation()}
                >
                  <p style={relevanceHeaderStyle}>⚡ QashqAI Voice Relevance</p>
                  <div style={agentRowStyle}>
                    <span style={agentLabelStyle}>Language Detector</span>
                    <span style={agentTextStyle}>{card.relevance.languageDetector}</span>
                  </div>
                  <div style={agentRowStyle}>
                    <span style={agentLabelStyle}>Cultural Guardian</span>
                    <span style={agentTextStyle}>{card.relevance.culturalGuardian}</span>
                  </div>
                  <div style={agentRowStyle}>
                    <span style={agentLabelStyle}>Reasoning Agent</span>
                    <span style={agentTextStyle}>{card.relevance.reasoningAgent}</span>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* Footer */}
      <footer style={footerStyle}>
        <p style={{ margin: '0 0 6px' }}>
          <a href="https://qashqaivoice.com" style={footerLinkStyle} target="_blank" rel="noopener noreferrer">
            qashqaivoice.com
          </a>
        </p>
        <p style={{ margin: 0, fontSize: '0.8rem' }}>
          QashqAI Voice · Preserving the Qashqai language through ethical AI · v0.3.0
        </p>
      </footer>
    </div>
  )
}
