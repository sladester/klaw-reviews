// src/components/stats/ReviewerDisagreement.jsx
import { useState } from 'react'
import { reviewerDisagreement } from '../../lib/stats'

const NAMES = { kris: 'K', laurie: 'L', wendy: 'W' }

export default function ReviewerDisagreement({ drinks, goToList }) {
  const [expanded, setExpanded] = useState(false)
  const data = reviewerDisagreement(drinks)
  const visible = expanded ? data : data.slice(0, 5)

  if (!data.length) {
    return (
      <section
        className="rounded-xl p-4"
        style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
          Reviewer Disagreement
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No drinks rated by 2+ sisters yet.
        </p>
      </section>
    )
  }

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
    >
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
        Reviewer Disagreement
      </h2>
      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
        Drinks the sisters most disagreed about
      </p>

      <ul className="space-y-1">
        {visible.map(({ drink, spread, scores }) => (
          <li key={drink._row}>
            <button
              type="button"
              onClick={() => goToList?.({ openDrink: drink })}
              className="w-full flex items-baseline justify-between gap-3 py-1 px-2 -mx-2 rounded-lg text-left transition hover:opacity-80 active:scale-[.99] cursor-pointer"
              title={`View ${drink.brand} ${drink.flavor}`}
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold">{drink.brand}</span>
                <span style={{ color: 'var(--text-muted)' }}> — {drink.flavor}</span>
                <span className="block text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {scores.map(s => `${NAMES[s.reviewer]}${s.score}`).join(' · ')}
                </span>
              </span>
              <span
                className="shrink-0 text-sm font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--divider)',
                }}
                title={`Spread: ${spread} points`}
              >
                Δ {spread}
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