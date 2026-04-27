// src/components/stats/TopRated.jsx
import { useState } from 'react'
import { topRated } from '../../lib/stats'

export default function TopRated({ drinks, goToList }) {
  const [expanded, setExpanded] = useState(false)
  const data = topRated(drinks)
  const visible = expanded ? data : data.slice(0, 5)

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
    >
      <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>
        Top Rated
      </h2>
      <ul className="space-y-1">
        {visible.map(d => (
          <li key={d._row}>
            <button
              type="button"
              onClick={() => goToList?.({ openDrink: d })}
              className="w-full flex items-baseline justify-between gap-3 py-1 px-2 -mx-2 rounded-lg text-left transition hover:opacity-80 active:scale-[.99] cursor-pointer"
              title={`View ${d.brand} ${d.flavor}`}
            >
              <span className="min-w-0 flex-1">
                <span className="font-bold mr-2" style={{ color: 'var(--accent-primary)' }}>
                  {d.ratings.overall}
                </span>
                <span className="font-semibold">{d.brand}</span>
                <span style={{ color: 'var(--text-muted)' }}> — {d.flavor}</span>
              </span>
              <span className="text-xs shrink-0 px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--divider)',
                }}
              >
                {d.type}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {data.length > 5 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-sm font-semibold transition active:scale-95"
          style={{ color: 'var(--accent-primary)' }}
        >
          {expanded ? 'Show less' : `Show all ${data.length}`}
        </button>
      )}
    </section>
  )
}