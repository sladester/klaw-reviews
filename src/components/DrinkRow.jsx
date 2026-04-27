export default function DrinkRow({ drink }) {
  const needsReview = drink.ratings.overall == null

  return (
    <div
      className="flex items-center gap-4 pb-3"
      style={{ borderBottom: '1px solid var(--divider)' }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0"
        style={
          needsReview
            ? { background: '#facc15', color: '#713f12' }  // amber-400 bg, amber-900 text
            : { background: 'var(--rating-bg)', color: 'var(--rating-fg)' }
        }
        title={needsReview ? 'Needs review — no overall rating yet' : undefined}
      >
        {needsReview ? '?' : drink.ratings.overall}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="font-bold truncate"
          style={{ color: 'var(--text-strong)' }}
        >
          {drink.brand} — {drink.flavor}
        </div>
        <div
          className="text-sm flex flex-wrap items-center gap-x-2"
          style={{ color: 'var(--text-body)' }}
        >
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: 'var(--bg-from)',
              color: 'var(--accent-primary)',
            }}
          >
            {drink.type}
          </span>
          {drink.calories != null && <span>{drink.calories} cal</span>}
          {drink.abv != null && <span>{drink.abv}% ABV</span>}
          {drink.thcMg != null && <span>{drink.thcMg}mg THC</span>}
        </div>
        {drink.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {drink.tags.map(t => (
              <span
                key={t}
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}