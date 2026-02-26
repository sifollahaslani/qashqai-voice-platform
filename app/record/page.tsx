'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// ---------- Types ----------

interface Recording {
  id:       number
  blob:     Blob
  url:      string
  label:    string
  duration: number   // seconds
}

// ---------- Helpers ----------

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Suggested prompts the user can read aloud while recording
const PROMPT_PHRASES = [
  'سلام',
  'ممنون',
  'بیر',
  'ایکی',
  'اوچ',
  'آت',
  'قویون',
  'من قاشقایام',
  'سن نئجه‌سین؟',
  'بو دیل بیزیم دیلیمیز',
]

// ---------- Component ----------

export default function RecordPage() {
  const [supported,   setSupported]   = useState(true)
  const [permission,  setPermission]  = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [recording,   setRecording]   = useState(false)
  const [elapsed,     setElapsed]     = useState(0)
  const [recordings,  setRecordings]  = useState<Recording[]>([])
  const [playingId,   setPlayingId]   = useState<number | null>(null)
  const [promptIdx,   setPromptIdx]   = useState(0)

  const mediaRef    = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRefs   = useRef<Map<number, HTMLAudioElement>>(new Map())
  const idCounter   = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false)
    }
  }, [])

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      recordings.forEach((r) => URL.revokeObjectURL(r.url))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
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
    chunksRef.current = []
    const mr = new MediaRecorder(stream)
    mediaRef.current = mr

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const url  = URL.createObjectURL(blob)
      const id   = ++idCounter.current

      setRecordings((prev) => [
        ...prev,
        {
          id,
          blob,
          url,
          label:    PROMPT_PHRASES[promptIdx] ?? `Recording ${id}`,
          duration: elapsed,
        },
      ])
      setElapsed(0)
      stopTimer()
    }

    mr.start()
    setRecording(true)
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  function togglePlay(rec: Recording) {
    const existing = audioRefs.current.get(rec.id)

    if (existing && !existing.paused) {
      existing.pause()
      setPlayingId(null)
      return
    }

    // Pause any other playing audio
    audioRefs.current.forEach((a, id) => {
      if (id !== rec.id) { a.pause(); a.currentTime = 0 }
    })

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

  function saveRecording(rec: Recording) {
    const a = document.createElement('a')
    a.href = rec.url
    a.download = `qashqai-${rec.label.replace(/\s+/g, '-')}-${rec.id}.webm`
    a.click()
  }

  return (
    <>
      <a href="#recorder" className="skip-link">Skip to recorder</a>

      <header className="site-header">
        <div className="container">
          <a href="/" className="site-logo" aria-label="QashqAI Voice home">
            Qashq<span>AI</span> Voice
          </a>
          <nav className="site-nav" aria-label="Main navigation">
            <a href="/classroom" className="site-nav__link">Classroom</a>
            <a href="/record"    className="site-nav__link" aria-current="page">Record</a>
          </nav>
          <span className="site-badge">v0.3.0 · prototype</span>
        </div>
      </header>

      <main id="main-content">

        <section className="hero" aria-labelledby="record-heading">
          <div className="container">
            <a href="/" className="back-link">← Home</a>
            <h1 id="record-heading" style={{ marginTop: 'var(--space-4)' }}>
              Voice Recording
            </h1>
            <p>
              Contribute to Qashqai language preservation by recording words and phrases.
              Recordings stay entirely in your browser — nothing is uploaded.
            </p>
          </div>
        </section>

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
            {/* Recorder */}
            <section id="recorder" className="section" aria-labelledby="recorder-heading">
              <div className="container">
                <p className="section-label">Step 1</p>
                <h2 id="recorder-heading">Choose a phrase &amp; record</h2>

                {/* Prompt selector */}
                <div className="recorder-prompt-area">
                  <p className="form-label" id="prompt-label">Phrase prompt</p>
                  <div
                    className="phrase-chips"
                    role="group"
                    aria-labelledby="prompt-label"
                  >
                    {PROMPT_PHRASES.map((p, i) => (
                      <button
                        key={p}
                        type="button"
                        className={`phrase-chip${i === promptIdx ? ' phrase-chip--active' : ''}`}
                        aria-pressed={i === promptIdx}
                        data-lang="qashqai"
                        onClick={() => setPromptIdx(i)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Currently selected phrase — displayed large for reading aloud */}
                  <div
                    className="recorder-prompt-display"
                    lang="az"
                    dir="rtl"
                    aria-label={`Phrase to record: ${PROMPT_PHRASES[promptIdx]}`}
                    aria-live="polite"
                  >
                    {PROMPT_PHRASES[promptIdx]}
                  </div>
                </div>

                {/* Permission denied */}
                {permission === 'denied' && (
                  <div className="chat-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                    Microphone access was denied. Please allow microphone permissions
                    in your browser settings and reload the page.
                  </div>
                )}

                {/* Record / Stop button + timer */}
                <div className="recorder-controls" aria-label="Recording controls">
                  {!recording ? (
                    <button
                      className="btn-record"
                      onClick={requestAndStart}
                      disabled={permission === 'denied'}
                      aria-label="Start recording"
                    >
                      <span className="btn-record__dot" aria-hidden="true" />
                      Record
                    </button>
                  ) : (
                    <button
                      className="btn-record btn-record--stop"
                      onClick={stopRecording}
                      aria-label="Stop recording"
                    >
                      <span className="btn-record__square" aria-hidden="true" />
                      Stop
                    </button>
                  )}

                  {recording && (
                    <span className="recorder-timer" aria-live="polite" aria-atomic="true">
                      {formatDuration(elapsed)}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Saved recordings */}
            {recordings.length > 0 && (
              <section className="section" aria-labelledby="saved-heading">
                <div className="container">
                  <p className="section-label">Step 2</p>
                  <h2 id="saved-heading">Your recordings</h2>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
                    Play back each take, then save the ones you want to keep.
                  </p>

                  <ul className="recording-list" aria-label="Saved recordings">
                    {recordings.map((rec) => (
                      <li key={rec.id} className="recording-item">
                        {/* Phrase label + duration */}
                        <div className="recording-item__info">
                          <span
                            className="recording-item__phrase"
                            lang="az"
                            dir="rtl"
                          >
                            {rec.label}
                          </span>
                          <span className="recording-item__meta">
                            {formatDuration(rec.duration)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="recording-item__actions">
                          <button
                            className="btn-icon"
                            onClick={() => togglePlay(rec)}
                            aria-label={
                              playingId === rec.id
                                ? `Pause ${rec.label}`
                                : `Play ${rec.label}`
                            }
                            aria-pressed={playingId === rec.id}
                          >
                            {playingId === rec.id ? '⏸' : '▶'}
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => saveRecording(rec)}
                            aria-label={`Save ${rec.label} as audio file`}
                          >
                            ↓
                          </button>
                          <button
                            className="btn-icon btn-icon--danger"
                            onClick={() => deleteRecording(rec.id)}
                            aria-label={`Delete recording of ${rec.label}`}
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
