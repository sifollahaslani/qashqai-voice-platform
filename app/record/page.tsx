'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Dialect  = 'kashkuli' | 'darrashuri' | 'farsi-madan' | 'amaleh' | 'shishboluki' | ''
type Category = 'greeting' | 'story' | 'song' | 'word' | 'phrase' | 'conversation' | ''

interface Metadata {
  speakerName:   string
  speakerAge:    string
  dialect:       Dialect
  category:      Category
  transcription: string
  translationEn: string
  translationDe: string
  translationFa: string
}

interface Recording {
  id:       number
  blob:     Blob
  url:      string
  duration: number   // seconds
  meta:     Metadata
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const EMPTY_META: Metadata = {
  speakerName: '', speakerAge: '', dialect: '', category: '',
  transcription: '', translationEn: '', translationDe: '', translationFa: '',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecordPage() {
  // Recording machine state
  const [supported,   setSupported]   = useState(true)
  const [permission,  setPermission]  = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [recording,   setRecording]   = useState(false)
  const [elapsed,     setElapsed]     = useState(0)

  // Pending take: captured after stop, waiting for metadata before save
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [pendingUrl,  setPendingUrl]  = useState<string | null>(null)
  const [pendingDur,  setPendingDur]  = useState(0)
  const [meta,        setMeta]        = useState<Metadata>(EMPTY_META)

  // Saved session takes
  const [recordings,  setRecordings]  = useState<Recording[]>([])
  const [playingId,   setPlayingId]   = useState<number | null>(null)

  const mediaRef   = useRef<MediaRecorder | null>(null)
  const chunksRef  = useRef<Blob[]>([])
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef(0)   // always-current elapsed for use inside closures
  const audioRefs  = useRef<Map<number, HTMLAudioElement>>(new Map())
  const idCounter  = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false)
    }
  }, [])

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      recordings.forEach((r) => URL.revokeObjectURL(r.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  async function requestAndStart() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermission('granted')
      startRecording(stream)
    } catch {
      setPermission('denied')
    }
  }

  function startRecording(stream: MediaStream) {
    // Discard any unsaved pending take
    if (pendingUrl) URL.revokeObjectURL(pendingUrl)
    setPendingBlob(null)
    setPendingUrl(null)

    chunksRef.current = []
    const mr = new MediaRecorder(stream)
    mediaRef.current = mr

    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const url  = URL.createObjectURL(blob)
      setPendingBlob(blob)
      setPendingUrl(url)
      setPendingDur(elapsedRef.current)
      stopTimer()
    }

    mr.start()
    setRecording(true)
    elapsedRef.current = 0
    setElapsed(0)
    timerRef.current = setInterval(() => {
      setElapsed((s) => { elapsedRef.current = s + 1; return s + 1 })
    }, 1000)
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  function saveRecording() {
    if (!pendingBlob || !pendingUrl) return
    const id = ++idCounter.current
    setRecordings((prev) => [
      { id, blob: pendingBlob, url: pendingUrl, duration: pendingDur, meta },
      ...prev,
    ])
    setPendingBlob(null)
    setPendingUrl(null)
    setPendingDur(0)
    setMeta(EMPTY_META)
  }

  function discardPending() {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl)
    setPendingBlob(null)
    setPendingUrl(null)
    setPendingDur(0)
    setMeta(EMPTY_META)
  }

  function togglePlay(rec: Recording) {
    const existing = audioRefs.current.get(rec.id)
    if (existing && !existing.paused) {
      existing.pause()
      setPlayingId(null)
      return
    }
    // Pause any other playing take
    audioRefs.current.forEach((a, id) => { if (id !== rec.id) { a.pause(); a.currentTime = 0 } })
    const audio = existing ?? new Audio(rec.url)
    audioRefs.current.set(rec.id, audio)
    audio.onended = () => setPlayingId(null)
    audio.play()
    setPlayingId(rec.id)
  }

  function deleteRecording(id: number) {
    const rec = recordings.find((r) => r.id === id)
    if (rec) URL.revokeObjectURL(rec.url)
    audioRefs.current.delete(id)
    setRecordings((prev) => prev.filter((r) => r.id !== id))
    if (playingId === id) setPlayingId(null)
  }

  function downloadRecording(rec: Recording) {
    const parts = [
      rec.meta.speakerName || 'speaker',
      rec.meta.dialect     || 'qashqai',
      rec.meta.category    || 'phrase',
      rec.id,
    ].join('-').replace(/[^a-z0-9-]/gi, '_').toLowerCase()
    const a = document.createElement('a')
    a.href     = rec.url
    a.download = `qashqai-${parts}.webm`
    a.click()
  }

  function updateMeta(key: keyof Metadata, value: string) {
    setMeta((prev) => ({ ...prev, [key]: value }))
  }

  // Hint text below the mic button
  const hint =
    permission === 'denied' ? 'Microphone access denied — allow it in browser settings' :
    recording               ? 'Recording… tap to stop'                                   :
    pendingUrl              ? 'Take captured — fill in the details below'                :
                              'Tap to start recording'

  return (
    <>
      <a href="#recorder" className="skip-link">Skip to recorder</a>

      {/* ── Header ── */}
      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">
            Qashq<span>AI</span> Voice
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link">Classroom</a>
            <a href="/record"    className="site-nav__link" aria-current="page">Record</a>
            <a href="/about"     className="site-nav__link">About</a>
          </nav>
          <span className="site-badge">v0.3.0 · prototype</span>
        </div>
      </header>

      <main id="main-content">

        {/* ── Hero ── */}
        <section className="hero hero--compact" aria-labelledby="record-heading">
          <div className="container">
            <a href="/" className="back-link">← Home</a>
            <h1 id="record-heading">
              Voice Recording{' '}
              <em className="hero__beta">Beta</em>
            </h1>
            <p>
              Contribute to Qashqai language preservation by recording words and phrases.
              Recordings stay entirely in your browser — nothing is uploaded.
            </p>
          </div>
        </section>

        {/* ── Unsupported browser ── */}
        {!supported && (
          <section className="section">
            <div className="container">
              <div className="recorder-unsupported" role="alert">
                <strong>Browser not supported.</strong> Please use a modern browser
                (Chrome, Firefox, or Safari 14.1+) to access the microphone.
              </div>
            </div>
          </section>
        )}

        {supported && (
          <>
            {/* ════ Microphone stage ════ */}
            <section id="recorder" className="rec-stage" aria-labelledby="mic-heading">
              <div className="container">
                <h2 id="mic-heading" className="sr-only">Microphone</h2>

                {/* Timer */}
                <div
                  className={`rec-timer${recording ? ' rec-timer--active' : ''}`}
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={recording ? `Recording: ${formatTime(elapsed)}` : 'Timer'}
                >
                  {formatTime(elapsed)}
                </div>

                {/* Mic button + pulse ring */}
                <div className="rec-mic-wrap">
                  {recording && <span className="rec-pulse" aria-hidden="true" />}
                  <button
                    className={`rec-mic-btn${recording ? ' rec-mic-btn--active' : ''}`}
                    onClick={recording ? stopRecording : requestAndStart}
                    disabled={permission === 'denied'}
                    aria-label={recording ? 'Stop recording' : 'Start recording'}
                    aria-pressed={recording}
                  >
                    <span className="rec-mic-icon" aria-hidden="true">
                      {recording ? '⏹' : '🎙'}
                    </span>
                  </button>
                </div>

                {/* Hint text */}
                <p className="rec-hint" aria-live="polite">{hint}</p>

                {/* Permission denied alert */}
                {permission === 'denied' && (
                  <div className="chat-error" role="alert">
                    Microphone access was denied. Allow microphone permissions in your
                    browser settings and reload the page.
                  </div>
                )}
              </div>
            </section>

            {/* ════ Metadata form (appears after each take) ════ */}
            {pendingUrl && (
              <section className="section rec-meta-section" aria-labelledby="meta-heading">
                <div className="container">
                  <div className="kilim-strip" aria-hidden="true" />
                  <h2 id="meta-heading" className="kilim-heading">Add recording details</h2>
                  <p className="rec-meta-intro">
                    Fill in what you know — all fields except transcription are optional.
                  </p>

                  {/* Inline playback preview */}
                  <div className="rec-preview">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio src={pendingUrl} controls className="rec-audio-preview" />
                    <span className="rec-preview__dur">{formatTime(pendingDur)}</span>
                  </div>

                  <form
                    className="rec-meta-form"
                    onSubmit={(e) => { e.preventDefault(); saveRecording() }}
                    aria-label="Recording metadata"
                  >
                    {/* Speaker name + age */}
                    <div className="rec-form-row">
                      <div className="rec-form-group">
                        <label htmlFor="meta-name" className="form-label">
                          Speaker name{' '}
                          <span className="form-optional">(optional)</span>
                        </label>
                        <input
                          id="meta-name"
                          type="text"
                          className="form-input"
                          placeholder="e.g. Fatima"
                          value={meta.speakerName}
                          onChange={(e) => updateMeta('speakerName', e.target.value)}
                        />
                      </div>
                      <div className="rec-form-group rec-form-group--sm">
                        <label htmlFor="meta-age" className="form-label">
                          Age{' '}
                          <span className="form-optional">(optional)</span>
                        </label>
                        <input
                          id="meta-age"
                          type="number"
                          className="form-input"
                          placeholder="45"
                          min="1"
                          max="120"
                          value={meta.speakerAge}
                          onChange={(e) => updateMeta('speakerAge', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Dialect + category */}
                    <div className="rec-form-row">
                      <div className="rec-form-group">
                        <label htmlFor="meta-dialect" className="form-label">
                          Dialect / Region
                        </label>
                        <select
                          id="meta-dialect"
                          className="form-select"
                          value={meta.dialect}
                          onChange={(e) => updateMeta('dialect', e.target.value as Dialect)}
                        >
                          <option value="">— select —</option>
                          <option value="kashkuli">Kashkuli</option>
                          <option value="darrashuri">Darrashuri</option>
                          <option value="farsi-madan">Farsi-Madan</option>
                          <option value="amaleh">Amaleh</option>
                          <option value="shishboluki">Shishboluki</option>
                        </select>
                      </div>
                      <div className="rec-form-group">
                        <label htmlFor="meta-category" className="form-label">Category</label>
                        <select
                          id="meta-category"
                          className="form-select"
                          value={meta.category}
                          onChange={(e) => updateMeta('category', e.target.value as Category)}
                        >
                          <option value="">— select —</option>
                          <option value="greeting">Greeting</option>
                          <option value="story">Story</option>
                          <option value="song">Song</option>
                          <option value="word">Word</option>
                          <option value="phrase">Phrase</option>
                          <option value="conversation">Conversation</option>
                        </select>
                      </div>
                    </div>

                    {/* Qashqai transcription (RTL) */}
                    <div className="rec-form-group">
                      <label htmlFor="meta-transcription" className="form-label">
                        Transcription{' '}
                        <span className="form-optional">(Qashqai text)</span>
                      </label>
                      <textarea
                        id="meta-transcription"
                        className="form-textarea"
                        dir="rtl"
                        lang="az"
                        placeholder="بو دیل بیزیم دیلیمیز…"
                        rows={2}
                        value={meta.transcription}
                        onChange={(e) => updateMeta('transcription', e.target.value)}
                      />
                    </div>

                    {/* Translations */}
                    <fieldset className="rec-translations-fieldset">
                      <legend className="form-label">
                        Translations{' '}
                        <span className="form-optional">(optional)</span>
                      </legend>
                      <div className="rec-translations-grid">
                        <div className="rec-form-group">
                          <label htmlFor="meta-en" className="form-label form-label--sm">
                            <span className="lang-tag">EN</span> English
                          </label>
                          <input
                            id="meta-en"
                            type="text"
                            className="form-input"
                            lang="en"
                            placeholder="English translation"
                            value={meta.translationEn}
                            onChange={(e) => updateMeta('translationEn', e.target.value)}
                          />
                        </div>
                        <div className="rec-form-group">
                          <label htmlFor="meta-de" className="form-label form-label--sm">
                            <span className="lang-tag lang-tag--de">DE</span> German
                          </label>
                          <input
                            id="meta-de"
                            type="text"
                            className="form-input"
                            lang="de"
                            placeholder="Deutsche Übersetzung"
                            value={meta.translationDe}
                            onChange={(e) => updateMeta('translationDe', e.target.value)}
                          />
                        </div>
                        <div className="rec-form-group">
                          <label htmlFor="meta-fa" className="form-label form-label--sm">
                            <span className="lang-tag">FA</span> Persian
                          </label>
                          <input
                            id="meta-fa"
                            type="text"
                            className="form-input"
                            dir="rtl"
                            lang="fa"
                            placeholder="ترجمه فارسی"
                            value={meta.translationFa}
                            onChange={(e) => updateMeta('translationFa', e.target.value)}
                          />
                        </div>
                      </div>
                    </fieldset>

                    <div className="rec-meta-actions">
                      <button type="submit" className="btn btn--primary">
                        Save recording
                      </button>
                      <button type="button" className="btn btn--ghost" onClick={discardPending}>
                        Discard take
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {/* ════ Session recording list ════ */}
            {recordings.length > 0 && (
              <section className="section" aria-labelledby="saved-heading">
                <div className="container">
                  <div className="kilim-strip" aria-hidden="true" />
                  <div className="phrase-grid-header">
                    <h2 id="saved-heading" className="kilim-heading">Session recordings</h2>
                    <span className="phrase-count">
                      {recordings.length} {recordings.length === 1 ? 'take' : 'takes'}
                    </span>
                  </div>

                  <ul className="recording-list" aria-label="Session recordings">
                    {recordings.map((rec) => (
                      <li key={rec.id} className="recording-item recording-item--v2">

                        {/* Transcription + duration */}
                        <div className="recording-item__header">
                          <span
                            className="recording-item__phrase"
                            lang="az"
                            dir={rec.meta.transcription ? 'rtl' : undefined}
                          >
                            {rec.meta.transcription || `Take ${rec.id}`}
                          </span>
                          <span className="recording-item__meta">
                            {formatTime(rec.duration)}
                          </span>
                        </div>

                        {/* Dialect / category / speaker tags */}
                        <div className="recording-item__tags">
                          {rec.meta.dialect && (
                            <span className="rec-tag">{rec.meta.dialect}</span>
                          )}
                          {rec.meta.category && (
                            <span className="rec-tag rec-tag--cat">{rec.meta.category}</span>
                          )}
                          {rec.meta.speakerName && (
                            <span className="rec-tag rec-tag--speaker">
                              {rec.meta.speakerName}
                              {rec.meta.speakerAge ? `, ${rec.meta.speakerAge}` : ''}
                            </span>
                          )}
                        </div>

                        {/* Translation preview */}
                        {(rec.meta.translationEn || rec.meta.translationDe || rec.meta.translationFa) && (
                          <dl className="rec-translations-preview">
                            {rec.meta.translationEn && (
                              <div className="rec-tl-row">
                                <dt className="lang-tag lang-tag--sm">EN</dt>
                                <dd lang="en">{rec.meta.translationEn}</dd>
                              </div>
                            )}
                            {rec.meta.translationDe && (
                              <div className="rec-tl-row">
                                <dt className="lang-tag lang-tag--sm lang-tag--de">DE</dt>
                                <dd lang="de">{rec.meta.translationDe}</dd>
                              </div>
                            )}
                            {rec.meta.translationFa && (
                              <div className="rec-tl-row">
                                <dt className="lang-tag lang-tag--sm">FA</dt>
                                <dd lang="fa" dir="rtl">{rec.meta.translationFa}</dd>
                              </div>
                            )}
                          </dl>
                        )}

                        {/* Action buttons */}
                        <div className="recording-item__actions">
                          <button
                            className="btn-icon"
                            onClick={() => togglePlay(rec)}
                            aria-label={playingId === rec.id ? `Pause take ${rec.id}` : `Play take ${rec.id}`}
                            aria-pressed={playingId === rec.id}
                          >
                            {playingId === rec.id ? '⏸' : '▶'}
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => downloadRecording(rec)}
                            aria-label={`Download take ${rec.id}`}
                          >
                            ↓
                          </button>
                          <button
                            className="btn-icon btn-icon--danger"
                            onClick={() => deleteRecording(rec.id)}
                            aria-label={`Delete take ${rec.id}`}
                          >
                            ✕
                          </button>
                        </div>

                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="footer-note">QashqAI Voice · v0.3.0 · Prototype</p>
          <p className="footer-note">
            Recordings are processed entirely in your browser and are never uploaded.
          </p>
        </div>
      </footer>
    </>
  )
}
