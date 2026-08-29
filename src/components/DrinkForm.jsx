// src/components/DrinkForm.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { addDrink, updateDrink } from '../lib/sheets'

// Initial form state for "add" mode (empty fields)
const EMPTY_FORM = {
  brand: '',
  flavor: '',
  type: '',
  overall: '',
  kris: '',
  laurie: '',
  wendy: '',
  calories: '',
  abv: '',
  thcMg: '',
  tags: '',
  notes: '',
}

// Fields sent to the Apps Script, matching the keys its COLS map expects.
const PAYLOAD_FIELDS = [
  'brand', 'flavor', 'type', 'overall', 'kris', 'laurie', 'wendy',
  'calories', 'abv', 'thcMg', 'tags', 'notes',
]

// validate() in apps-script/Code.gs requires these, so they go on every save
// even when unchanged — otherwise the server rejects the update.
const ALWAYS_SEND = ['brand', 'flavor', 'type', 'overall']

const TRIM_FIELDS = ['brand', 'flavor', 'type', 'tags']

// Convert a Drink object (as fetched) into form state (strings, no nulls)
function drinkToForm(d) {
  return {
    brand:    d.brand ?? '',
    flavor:   d.flavor ?? '',
    type:     d.type ?? '',
    overall:  numToStr(d.ratings.overall),
    kris:     numToStr(d.ratings.kris),
    laurie:   numToStr(d.ratings.laurie),
    wendy:    numToStr(d.ratings.wendy),
    calories: numToStr(d.calories),
    abv:      numToStr(d.abv),
    thcMg:    numToStr(d.thcMg),
    tags:     (d.tags ?? []).join(' '),
    notes:    d.notes ?? '',
  }
}

function numToStr(n) {
  return n == null ? '' : String(n)
}

export default function DrinkForm({ mode, drink, knownTypes, onClose, onSaved }) {
  const isEdit = mode === 'edit'
  const initial = useMemo(
    () => (isEdit && drink ? drinkToForm(drink) : EMPTY_FORM),
    [isEdit, drink]
  )

  const [form, setForm]               = useState(initial)
  // Expand automatically when the drink already has per-reviewer ratings.
  // Collapsed, they're invisible on an existing drink and read as missing.
  const [showReviewers, setShowRev]   = useState(
    Boolean(initial.kris || initial.laurie || initial.wendy)
  )
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const [typeMode, setTypeMode]       = useState(
    isEdit && drink && !knownTypes.includes(drink.type) ? 'custom' : 'select'
  )

  const initialRef = useRef(initial)
  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialRef.current),
    [form]
  )

  // Required-field validation
  const errors = {}
  if (!form.brand.trim())  errors.brand  = 'Required'
  if (!form.flavor.trim()) errors.flavor = 'Required'
  if (!form.type.trim())   errors.type   = 'Required'
  if (form.overall === '') errors.overall = 'Required'
  const isValid = Object.keys(errors).length === 0

  // Close on Escape (with confirm if dirty)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') attemptClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function attemptClose() {
    if (saving) return
    if (dirty && !confirm('Discard changes?')) return
    onClose()
  }

  async function handleSave() {
    if (!isValid || saving) return
    setError(null)
    setSaving(true)
    try {
      // Send only the fields the user actually changed. Anything omitted keeps
      // its current value in the sheet, so a save can't wipe an edit made
      // directly in Google Sheets since this page last loaded.
      const payload = {}
      for (const key of PAYLOAD_FIELDS) {
        const value = form[key]
        const unchanged = isEdit && value === initialRef.current[key]
        if (unchanged && !ALWAYS_SEND.includes(key)) continue
        payload[key] = TRIM_FIELDS.includes(key) ? value.trim() : value
      }
      if (isEdit) {
        await updateDrink(drink._row, payload)
      } else {
        await addDrink(payload)
      }
      onSaved()
    } catch (ex) {
      setError(ex.message || 'Failed to save')
      setSaving(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-from)',
    border: '1px solid var(--divider)',
    color: 'var(--text-strong)',
  }
  const labelStyle = { color: 'var(--text-muted)' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) attemptClose() }}
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-2xl flex flex-col max-h-screen sm:max-h-[90vh]"
        style={{ background: 'var(--card-bg)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--divider)' }}
        >
          <h2 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            {isEdit ? 'Edit drink' : 'Add a drink'}
          </h2>
          <button
            onClick={attemptClose}
            disabled={saving}
            className="rounded-full w-9 h-9 flex items-center justify-center transition active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--bg-from)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
          <Field label="Brand" required error={errors.brand}>
            <input
              type="text"
              value={form.brand}
              onChange={e => update('brand', e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none"
              style={inputStyle}
              autoFocus={!isEdit}
            />
          </Field>

          <Field label="Flavor" required error={errors.flavor}>
            <input
              type="text"
              value={form.flavor}
              onChange={e => update('flavor', e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none"
              style={inputStyle}
            />
          </Field>

          <Field label="Type" required error={errors.type}>
            {typeMode === 'select' ? (
              <select
                value={form.type}
                onChange={e => {
                  if (e.target.value === '__other__') {
                    setTypeMode('custom')
                    update('type', '')
                  } else {
                    update('type', e.target.value)
                  }
                }}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={inputStyle}
              >
                <option value="">— Select —</option>
                {knownTypes.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__other__">Other…</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.type}
                  onChange={e => update('type', e.target.value)}
                  placeholder="Custom type"
                  className="flex-1 px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => { setTypeMode('select'); update('type', '') }}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--bg-from)', color: 'var(--text-muted)' }}
                >
                  ↩ List
                </button>
              </div>
            )}
          </Field>

          <Field label="Overall rating" required error={errors.overall} hint="1–11">
            <input
              type="number"
              min="1"
              max="11"
              step="1"
              value={form.overall}
              onChange={e => update('overall', e.target.value)}
              className="w-full px-3 py-2 rounded-lg outline-none"
              style={inputStyle}
            />
          </Field>

          {/* Optional per-reviewer ratings (collapsed by default) */}
          <div>
            <button
              type="button"
              onClick={() => setShowRev(s => !s)}
              className="text-sm font-semibold transition active:scale-95"
              style={{ color: 'var(--accent-primary)' }}
            >
              {showReviewers ? '− Hide' : '+ Add'} per-reviewer ratings
            </button>
            {showReviewers && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['kris', 'laurie', 'wendy'].map(r => (
                  <Field key={r} label={r[0].toUpperCase() + r.slice(1)}>
                    <input
                      type="number"
                      min="1"
                      max="11"
                      step="1"
                      value={form[r]}
                      onChange={e => update(r, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field label="Calories">
              <input
                type="number"
                min="0"
                step="1"
                value={form.calories}
                onChange={e => update('calories', e.target.value)}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="ABV %">
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.abv}
                onChange={e => update('abv', e.target.value)}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="THC mg">
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.thcMg}
                onChange={e => update('thcMg', e.target.value)}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Tags" hint="Space-separated, e.g. #summer #favorite">
            <input
              type="text"
              value={form.tags}
              onChange={e => update('tags', e.target.value)}
              placeholder="#tag1 #tag2"
              className="w-full px-3 py-2 rounded-lg outline-none"
              style={inputStyle}
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg outline-none resize-none"
              style={inputStyle}
            />
          </Field>

          {error && (
            <div
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: '#fee2e2', color: '#991b1b' }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3 shrink-0"
          style={{ borderTop: '1px solid var(--divider)' }}
        >
          <button
            onClick={attemptClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg font-semibold transition active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--bg-from)', color: 'var(--text-body)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-4 py-2 rounded-lg font-semibold text-white transition active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--accent-primary)' }}
          >
            {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Add drink')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Small label/error wrapper used by every field
function Field({ label, hint, required, error, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
          {label}
          {required && <span style={{ color: '#dc2626' }}> *</span>}
        </span>
        {error && (
          <span className="text-xs" style={{ color: '#dc2626' }}>{error}</span>
        )}
      </div>
      {children}
      {hint && !error && (
        <span className="block text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </label>
  )
}