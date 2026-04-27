// src/components/stats/ReviewsByType.jsx
import { reviewsByType } from '../../lib/stats'

export default function ReviewsByType({ drinks, goToList }) {
  const data = reviewsByType(drinks)
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
    >
      <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>
        Reviews by Type
      </h2>
      <ul className="space-y-2">
        {data.map(({ type, count, avgOverall }) => (
          <li key={type}>
            <button
              type="button"
              onClick={() => goToList?.({ type })}
              className="w-full text-left py-1 px-2 -mx-2 rounded-lg transition hover:opacity-80 active:scale-[.99] cursor-pointer"
              title={`Show all ${type} drinks`}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-semibold truncate">{type}</span>
                <span className="text-sm shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {count} {count === 1 ? 'drink' : 'drinks'}
                  {avgOverall != null && ` · avg ${avgOverall.toFixed(1)}`}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--card-bg)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(count / max) * 100}%`,
                    background: 'var(--accent-primary)',
                  }}
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}