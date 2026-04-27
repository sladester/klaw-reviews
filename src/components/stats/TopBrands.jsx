// src/components/stats/TopBrands.jsx
import { useState } from 'react'
import { topBrands } from '../../lib/stats'

export default function TopBrands({ drinks, goToList }) {
  const [expanded, setExpanded] = useState(false)
  const data = topBrands(drinks)
  const visible = expanded ? data : data.slice(0, 5)

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
    >
      <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>
        Top Brands
      </h2>
      <ul className="space-y-1">
        {visible.map(({ brand, count, avgOverall }) => (
          <li key={brand}>
            <button
              type="button"
              onClick={() => goToList?.({ search: brand })}
              className="w-full flex items-baseline justify-between gap-3 py-1 px-2 -mx-2 rounded-lg text-left transition hover:opacity-80 active:scale-[.99] cursor-pointer"
              title={`Show all ${brand} drinks`}
            >
              <span className="font-semibold truncate">{brand}</span>
              <span className="text-sm shrink-0" style={{ color: 'var(--text-muted)' }}>
                {count} {count === 1 ? 'flavor' : 'flavors'}
                {avgOverall != null && ` · avg ${avgOverall.toFixed(1)}`}
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