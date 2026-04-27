import { useMemo, useState } from 'react'
import TopBrands from './stats/TopBrands'
import TopRated from './stats/TopRated'
import BottomRated from './stats/BottomRated'
import ReviewsByType from './stats/ReviewsByType'
import RatingDistribution from './stats/RatingDistribution'
import ReviewerComparison from './stats/ReviewerComparison'
import ReviewerDisagreement from './stats/ReviewerDisagreement'

export default function StatsView({ drinks, goToList }) {
  const [typeFilter, setTypeFilter] = useState('all')

  const types = useMemo(() => {
    const s = new Set()
    for (const d of drinks) if (d.type) s.add(d.type)
    return [...s].sort()
  }, [drinks])

  const filtered = useMemo(
    () => (typeFilter === 'all' ? drinks : drinks.filter(d => d.type === typeFilter)),
    [drinks, typeFilter]
  )

  // Inherit the active Stats type filter when navigating to List view,
  // unless the click is to open a specific drink (then no extra filters).
  const goToListScoped = (filter) => {
    if (filter.openDrink) {
      goToList(filter)
      return
    }
    goToList({
      ...filter,
      type: filter.type ?? (typeFilter !== 'all' ? typeFilter : undefined),
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm font-semibold"
          style={{
            background: 'var(--card-bg)',
            color: 'var(--text-default)',
            border: '1px solid var(--divider)',
          }}
        >
          <option value="all">All types</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Showing stats for {filtered.length} {filtered.length === 1 ? 'drink' : 'drinks'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        <TopBrands drinks={filtered} goToList={goToListScoped} />
        <TopRated drinks={filtered} goToList={goToListScoped} />
        <BottomRated drinks={filtered} goToList={goToListScoped} />
        {typeFilter === 'all' && <ReviewsByType drinks={filtered} goToList={goToListScoped} />}
        <div className="lg:col-span-2">
          <RatingDistribution drinks={filtered} goToList={goToListScoped} />
        </div>
        <ReviewerComparison drinks={filtered} />
        <ReviewerDisagreement drinks={filtered} goToList={goToListScoped} />
      </div>
    </div>
  )
}