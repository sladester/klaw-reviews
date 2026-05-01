import { useEffect } from 'react'
import { totalWineUrl, googleUrl } from '../lib/links'

export default function DetailDrawer({ drink, onClose, onEdit }) {
  useEffect(() => {
    if (!drink) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drink, onClose])

  if (!drink) return null

  const needsReview = drink.ratings.overall == null
  const perReviewer = [
    { name: 'Kris',   value: drink.ratings.kris },
    { name: 'Laurie', value: drink.ratings.laurie },
    { name: 'Wendy',  value: drink.ratings.wendy },
  ]

  const ratingPillStyle = needsReview
    ? { background: '#facc15', color: '#713f12' }
    : { background: 'var(--rating-bg)', color: 'var(--rating-fg)' }

  const totalWineStyle = { background: 'var(--accent-primary)', color: '#ffffff' }
  const googleStyle = { background: 'var(--bg-from)', color: 'var(--text-body)', border: '1px solid var(--divider)' }
  const editStyle = { background: 'var(--bg-from)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />

      <div className="fixed z-50 left-0 right-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6">
        <div className="rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto sm:max-w-lg sm:w-full sm:max-h-[90vh]" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>

          <div className="sm:hidden mx-auto mb-3 rounded-full" style={{ width: 40, height: 4, background: 'var(--divider)' }} />

          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-3xl flex-shrink-0" style={ratingPillStyle}>
              {needsReview ? '?' : drink.ratings.overall}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg" style={{ color: 'var(--text-strong)' }}>{drink.brand}</div>
              <div className="text-base" style={{ color: 'var(--text-body)' }}>{drink.flavor}</div>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--bg-from)', color: 'var(--accent-primary)' }}>
                {drink.type}
              </span>
            </div>
            <button onClick={onClose} className="text-2xl rounded-full w-9 h-9 flex items-center justify-center transition active:scale-95 flex-shrink-0" style={{ background: 'var(--bg-from)', color: 'var(--text-body)', border: '1px solid var(--divider)' }} aria-label="Close">
              ×
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <Stat label="Calories" value={drink.calories} />
            <Stat label="ABV" value={drink.abv != null ? `${drink.abv}%` : null} />
            <Stat label="THC" value={drink.thcMg != null ? `${drink.thcMg}mg` : null} />
          </div>

          <div className="mb-4">
            <div className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
              Individual Ratings
            </div>
            <div className="flex gap-2">
              {perReviewer.map(r => (
                <div key={r.name} className="flex-1 rounded-lg p-2 text-center" style={{ background: 'var(--bg-from)' }}>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{r.name}</div>
                  <div className="text-2xl font-bold" style={{ color: r.value != null ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {r.value ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {drink.notes && (
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Notes</div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{drink.notes}</div>
            </div>
          )}

          {drink.tags.length > 0 && (
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Tags</div>
              <div className="flex flex-wrap gap-1">
                {drink.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-from)', color: 'var(--accent-primary)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {drink.dateAdded && (
            <div className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Added: {drink.dateAdded}
              {drink.lastModified && drink.lastModified !== drink.dateAdded && (
                <> · Updated: {drink.lastModified}</>
              )}
            </div>
          )}

          <div className="pt-4 flex gap-2" style={{ borderTop: '1px solid var(--divider)' }}>
            <a href={totalWineUrl(drink.brand, drink.flavor)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-lg font-medium text-sm transition active:scale-95" style={totalWineStyle}>
              🛒 Total Wine
            </a>
            <a href={googleUrl(drink.brand, drink.flavor)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-lg font-medium text-sm transition active:scale-95" style={googleStyle}>
              🔎 Google
            </a>
            {onEdit && (
              <button onClick={onEdit} className="flex-1 text-center py-2 rounded-lg font-medium text-sm transition active:scale-95" style={editStyle}>
                ✎ Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-from)' }}>
      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-base font-bold" style={{ color: 'var(--text-strong)' }}>{value ?? '—'}</div>
    </div>
  )
}