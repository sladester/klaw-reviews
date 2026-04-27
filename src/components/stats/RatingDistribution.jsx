// src/components/stats/RatingDistribution.jsx
import { ratingDistribution } from '../../lib/stats'

export default function RatingDistribution({ drinks, goToList }) {
  const data = ratingDistribution(drinks)
  if (!data.length) return null

  const max = Math.max(...data.map(d => d.count), 1)
  const minRating = Math.min(...data.map(d => d.rating))
  const maxRating = Math.max(...data.map(d => d.rating))

  // Fill in missing ratings between min and max with count=0 so the histogram
  // doesn't have gaps.
  const filled = []
  for (let r = minRating; r <= maxRating; r++) {
    const found = data.find(d => d.rating === r)
    filled.push({ rating: r, count: found ? found.count : 0 })
  }

  const total = filled.reduce((a, b) => a + b.count, 0)

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
    >
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
        Rating Distribution
      </h2>
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        {total} rated drinks · {drinks.length - total} unrated
      </p>
      <div className="flex items-end gap-1 h-32">
        {filled.map(({ rating, count }) => {
          const clickable = goToList && count > 0
          return (
            <button
              key={rating}
              type="button"
              disabled={!clickable}
              onClick={() => goToList({ rating })}
              className={`flex-1 flex flex-col items-center justify-end gap-1 h-full rounded transition ${
                clickable ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'
              }`}
              title={
                clickable
                  ? `Show drinks rated ${rating} (${count})`
                  : `Rating ${rating}: ${count} drinks`
              }
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {count || ''}
              </span>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(count / max) * 100}%`,
                  minHeight: count ? '2px' : '0',
                  background: 'var(--accent-primary)',
                }}
              />
              <span className="text-xs font-semibold">{rating}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}