'use client'

import { useState } from 'react'

const CONTENT_TYPES = [
  { value: 'word', label: 'Word' },
  { value: 'sentence', label: 'Sentence' },
  { value: 'story', label: 'Story' },
  { value: 'song', label: 'Song' },
  { value: 'proverb', label: 'Proverb' },
  { value: 'oral_history', label: 'Oral History' },
] as const

const CONSENT_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'archive_only', label: 'Archive Only' },
  { value: 'pending', label: 'Pending' },
] as const

const AI_USAGE_OPTIONS = [
  { value: 'allowed', label: 'Allowed' },
  { value: 'disallowed', label: 'Disallowed' },
  { value: 'review_required', label: 'Review Required' },
] as const

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'blocked', label: 'Blocked' },
] as const

const LANGUAGE_OPTIONS = [
  { value: 'qashqai', label: 'Qashqai' },
  { value: 'fa', label: 'Persian' },
  { value: 'tr', label: 'Turkish' },
  { value: 'en', label: 'English' },
] as const

interface FormData {
  title: string
  content_type: string
  language: string
  dialect: string
  speaker_id: string
  speaker_display_name: string
  recording_date: string
  collector_name: string
  consent_status: string
  ai_usage_permission: string
  visibility_status: string
  notes: string
}

const INITIAL: FormData = {
  title: '',
  content_type: 'word',
  language: 'qashqai',
  dialect: '',
  speaker_id: '',
  speaker_display_name: '',
  recording_date: '',
  collector_name: '',
  consent_status: 'pending',
  ai_usage_permission: 'review_required',
  visibility_status: 'internal',
  notes: '',
}

export default function MetadataForm() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors([])
    setSuccess(null)
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!form.title.trim()) errs.push('Title is required')
    if (!form.speaker_id.trim()) errs.push('Speaker ID is required')
    if (form.consent_status === 'pending' && form.visibility_status === 'public') {
      errs.push('Visibility cannot be public when consent is pending')
    }
    if (form.consent_status === 'archive_only' && form.visibility_status === 'public') {
      errs.push('Visibility cannot be public when consent is archive-only')
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    setErrors([])
    setSuccess(null)

    try {
      const payload: Record<string, string | null> = { ...form }
      if (!payload.dialect) payload.dialect = null
      if (!payload.speaker_display_name) payload.speaker_display_name = null
      if (!payload.recording_date) payload.recording_date = null
      if (!payload.collector_name) payload.collector_name = null
      if (!payload.notes) payload.notes = null

      const res = await fetch('/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const detail = body?.detail
        if (Array.isArray(detail)) {
          setErrors(detail.map((d: { msg: string }) => d.msg))
        } else if (typeof detail === 'string') {
          setErrors([detail])
        } else {
          setErrors([`Server error ${res.status}`])
        }
        return
      }

      const saved = await res.json()
      setSuccess(`Entry saved (ID: ${saved.id})`)
      setForm(INITIAL)
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Unknown error'])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="chat-form" onSubmit={handleSubmit} aria-label="Linguistic item metadata entry">
      {errors.length > 0 && (
        <div className="chat-error" role="alert">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
      {success && (
        <div className="metadata-success" role="status">{success}</div>
      )}

      {/* Title */}
      <div className="form-group">
        <label htmlFor="meta-title" className="form-label">Title *</label>
        <input
          id="meta-title"
          className="form-select"
          type="text"
          value={form.title}
          onChange={e => update('title', e.target.value)}
          placeholder="e.g. Greeting — Hello"
          dir="auto"
          required
        />
      </div>

      {/* Content type + Language */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="meta-content-type" className="form-label">Content Type *</label>
          <select
            id="meta-content-type"
            className="form-select"
            value={form.content_type}
            onChange={e => update('content_type', e.target.value)}
          >
            {CONTENT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="meta-language" className="form-label">Language *</label>
          <select
            id="meta-language"
            className="form-select"
            value={form.language}
            onChange={e => update('language', e.target.value)}
          >
            {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="meta-dialect" className="form-label">Dialect</label>
          <input
            id="meta-dialect"
            className="form-select"
            type="text"
            value={form.dialect}
            onChange={e => update('dialect', e.target.value)}
            placeholder="e.g. Kashkuli, Dareshuri"
            dir="auto"
          />
        </div>
      </div>

      {/* Speaker */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="meta-speaker-id" className="form-label">Speaker ID *</label>
          <input
            id="meta-speaker-id"
            className="form-select"
            type="text"
            value={form.speaker_id}
            onChange={e => update('speaker_id', e.target.value)}
            placeholder="e.g. SPK-001 or ANON-001"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="meta-speaker-name" className="form-label">Speaker Display Name</label>
          <input
            id="meta-speaker-name"
            className="form-select"
            type="text"
            value={form.speaker_display_name}
            onChange={e => update('speaker_display_name', e.target.value)}
            placeholder="Optional — leave blank for anonymity"
          />
        </div>
      </div>

      {/* Recording date + Collector */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="meta-date" className="form-label">Recording Date</label>
          <input
            id="meta-date"
            className="form-select"
            type="date"
            value={form.recording_date}
            onChange={e => update('recording_date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="meta-collector" className="form-label">Collector Name</label>
          <input
            id="meta-collector"
            className="form-select"
            type="text"
            value={form.collector_name}
            onChange={e => update('collector_name', e.target.value)}
            placeholder="Who collected this item?"
          />
        </div>
      </div>

      {/* Consent + AI usage + Visibility */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="meta-consent" className="form-label">Consent Status *</label>
          <select
            id="meta-consent"
            className="form-select"
            value={form.consent_status}
            onChange={e => update('consent_status', e.target.value)}
          >
            {CONSENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="meta-ai-usage" className="form-label">AI Usage Permission *</label>
          <select
            id="meta-ai-usage"
            className="form-select"
            value={form.ai_usage_permission}
            onChange={e => update('ai_usage_permission', e.target.value)}
          >
            {AI_USAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="meta-visibility" className="form-label">Visibility *</label>
          <select
            id="meta-visibility"
            className="form-select"
            value={form.visibility_status}
            onChange={e => update('visibility_status', e.target.value)}
          >
            {VISIBILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label htmlFor="meta-notes" className="form-label">Notes</label>
        <textarea
          id="meta-notes"
          className="form-textarea"
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          placeholder="Any additional context, cultural notes, or provenance details…"
          rows={3}
          dir="auto"
        />
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? 'Saving…' : 'Save Entry'}
      </button>
    </form>
  )
}
