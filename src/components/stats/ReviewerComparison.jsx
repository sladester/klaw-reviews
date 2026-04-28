// src/components/stats/ReviewerComparison.jsx
import { reviewerComparison } from '../../lib/stats'

const NAMES = { kris: 'Kris', laurie: 'Laurie', wendy: 'Wendy' }

export default function ReviewerComparison({ drinks, goToList }) {
  const { reviewers, mostGenerous, harshest } = reviewerComparison(drinks)
  const max = Math.max(...reviewers.map(r => r.avg ?? 0), 10)

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
    >
      <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>
        Reviewer Comparison
      </h2>

      <ul className="space-y-3">
        {reviewers.map(({ reviewer, count, avg }) => {
          const clickable = goToList && count > 0
          return (
            <li key={reviewer}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => goToList?.({ reviewer })}
                className={`w-full text-left py-1 px-2 -mx-2 rounded-lg transition ${
                  clickable ? 'cursor-pointer hover:opacity-80 active:scale-[.99]' : 'cursor-default'
                }`}
                title={clickable ? `Show drinks rated by ${NAMES[reviewer]}` : ''}
              >
                <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                  <span className="font-semibold flex items-center gap-2 flex-wrap">
                    <span>{NAMES[reviewer]}</span>
                    {reviewer === mostGenerous && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#dcfce7', color: '#166534' }}
                      >
                        Most generous
                      </span>
                    )}
                    {reviewer === harshest && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#fee2e2', color: '#991b1b' }}
                      >
                        Harshest
                      </span>
                    )}
                  </span>
                  <span className="text-sm shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {avg != null ? `avg ${avg.toFixed(2)}` : 'no ratings'}
                    {' · '}
                    {count} {count === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--card-bg)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: avg != null ? `${(avg / max) * 100}%` : '0%',
                      background: 'var(--accent-primary)',
                    }}
                  />
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}