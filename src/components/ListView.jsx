import { useEffect, useMemo, useState } from 'react'
import { applyFilters, SORT_OPTIONS, uniqueTypes, uniqueTags } from '../lib/filtering'
import DrinkRow from './DrinkRow'
import DetailDrawer from './DetailDrawer'

export default function ListView({ drinks, pendingFilter, onFilterApplied }) {
  const [search, setSearch]               = useState('')
  const [type, setType]                   = useState('All')
  const [tag, setTag]                     = useState('')
  const [sort, setSort]                   = useState('rating-desc')
  const [needsReviewOnly, setNeedsReview] = useState(false)
  const [rating, setRating]               = useState(null)
  const [selected, setSelected]           = useState(null)

  // Apply incoming filter from Stats view click-through
  useEffect(() => {
    if (!pendingFilter) return
    setSearch(pendingFilter.search ?? '')
    setType(pendingFilter.type ?? 'All')
    setTag('')
    setNeedsReview(false)
    setSort('rating-desc')
    setRating(pendingFilter.rating ?? null)
    setSelected(pendingFilter.openDrink ?? null)
    onFilterApplied()
  }, [pendingFilter, onFilterApplied])

  const types = useMemo(() => uniqueTypes(drinks), [drinks])
  const tags  = useMemo(() => uniqueTags(drinks),  [drinks])

  const unratedCount = useMemo(
    () => drinks.filter(d => d.ratings.overall == null).length,
    [drinks]
  )

  const filtered = useMemo(() => {
    let out = applyFilters(drinks, { search, type, tag, sort })
    if (needsReviewOnly) {
      out = out.filter(d => d.ratings.overall == null)
    }
    if (rating != null) {
      out = out.filter(
        d => d.ratings.overall != null && Math.round(d.ratings.overall) === rating
      )
    }
    return out
  }, [drinks, search, type, tag, sort, needsReviewOnly, rating])

  const inputStyle = {
    background: 'var(--bg-from)',
    border: '1px solid var(--divider)',
    color: 'var(--text-strong)',
  }

  const showChipRow = unratedCount > 0 || rating != null

  return (
    <>
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search brand, flavor, or notes…"
        className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 mb-3"
        style={inputStyle}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <select value={type} onChange={e => setType(e.target.value)}
                className="px-3 py-2 rounded-lg outline-none" style={inputStyle}>
          {types.map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>
          ))}
        </select>

        <select value={tag} onChange={e => setTag(e.target.value)}
                className="px-3 py-2 rounded-lg outline-none disabled:opacity-50"
                style={inputStyle} disabled={tags.length === 0}>
          <option value="">{tags.length === 0 ? 'No tags yet' : 'All tags'}</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-3 py-2 rounded-lg outline-none" style={inputStyle}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {showChipRow && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {unratedCount > 0 && (
            <button
              onClick={() => setNeedsReview(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition active:scale-95"
              style={
                needsReviewOnly
                  ? { background: '#facc15', color: '#713f12', border: '1px solid #facc15' }
                  : { background: 'var(--card-bg)', color: 'var(--text-body)', border: '1px solid var(--divider)' }
              }
            >
              <span style={{
                display: 'inline-block', width: '1.25rem', height: '1.25rem',
                borderRadius: '0.375rem', background: '#facc15', color: '#713f12',
                fontSize: '0.875rem', fontWeight: 700, lineHeight: '1.25rem', textAlign: 'center',
              }}>?</span>
              {needsReviewOnly
                ? `Showing ${unratedCount} needing review`
                : `${unratedCount} need${unratedCount === 1 ? 's' : ''} review`}
            </button>
          )}

          {rating != null && (
            <button
              onClick={() => setRating(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition active:scale-95"
              style={{ background: 'var(--accent-primary)', color: 'white' }}
              title="Clear rating filter"
            >
              <span>Rated {rating}</span>
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      )}

      <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent-leaf)' }}>
        {filtered.length === drinks.length
          ? `${drinks.length} drinks 🍋`
          : `${filtered.length} of ${drinks.length} drinks`}
      </p>

      <div className="space-y-3">
        {filtered.map((d, i) => (
          <button
            key={`${d.brand}-${d.flavor}-${i}`}
            onClick={() => setSelected(d)}
            className="w-full text-left transition active:scale-[.99] cursor-pointer"
          >
            <DrinkRow drink={d} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No drinks match your filters
          </p>
        )}
      </div>

      <DetailDrawer drink={selected} onClose={() => setSelected(null)} />
    </>
  )
}