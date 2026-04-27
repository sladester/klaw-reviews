// src/lib/stats.js
// Stat computations for KLaW Reviews.
// Each function takes the drinks array and returns a data structure
// the corresponding stats card can render.

const REVIEWERS = ['kris', 'laurie', 'wendy']

function mean(nums) {
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function reviewerScores(drink) {
  return REVIEWERS
    .map(r => ({ reviewer: r, score: drink.ratings[r] }))
    .filter(x => x.score != null)
}

// 1. Top Brands — most-reviewed brands first, with avg overall rating
export function topBrands(drinks) {
  const map = new Map()
  for (const d of drinks) {
    if (!d.brand) continue
    if (!map.has(d.brand)) map.set(d.brand, { ratings: [], count: 0 })
    const e = map.get(d.brand)
    e.count++
    if (d.ratings.overall != null) e.ratings.push(d.ratings.overall)
  }
  return [...map.entries()]
    .map(([brand, { ratings, count }]) => ({
      brand,
      count,
      avgOverall: mean(ratings),
    }))
    .sort((a, b) =>
      b.count - a.count ||
      (b.avgOverall ?? -1) - (a.avgOverall ?? -1)
    )
}

// 2. Top Rated — drinks sorted by overall desc, tiebreak by brand asc
export function topRated(drinks) {
  return drinks
    .filter(d => d.ratings.overall != null)
    .slice()
    .sort((a, b) =>
      b.ratings.overall - a.ratings.overall ||
      a.brand.localeCompare(b.brand)
    )
}

// 3. Bottom Rated — drinks sorted by overall asc (schadenfreude hall of fame)
export function bottomRated(drinks) {
  return drinks
    .filter(d => d.ratings.overall != null)
    .slice()
    .sort((a, b) =>
      a.ratings.overall - b.ratings.overall ||
      a.brand.localeCompare(b.brand)
    )
}

// 4. Reviews by Type — count + avg rating per type
export function reviewsByType(drinks) {
  const map = new Map()
  for (const d of drinks) {
    const t = d.type || '(none)'
    if (!map.has(t)) map.set(t, { ratings: [], count: 0 })
    const e = map.get(t)
    e.count++
    if (d.ratings.overall != null) e.ratings.push(d.ratings.overall)
  }
  return [...map.entries()]
    .map(([type, { ratings, count }]) => ({
      type,
      count,
      avgOverall: mean(ratings),
    }))
    .sort((a, b) => b.count - a.count)
}

// 5. Reviewer Comparison — avg + count per sister; tags harshest/most generous
export function reviewerComparison(drinks) {
  const stats = REVIEWERS.map(reviewer => {
    const scores = drinks
      .map(d => d.ratings[reviewer])
      .filter(s => s != null)
    return {
      reviewer,
      count: scores.length,
      avg: mean(scores),
    }
  })

  const withAvgs = stats.filter(s => s.avg != null)
  const sorted = [...stats].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))

  let mostGenerous = null
  let harshest = null
  if (withAvgs.length >= 2) {
    mostGenerous = withAvgs.reduce((a, b) => (a.avg > b.avg ? a : b)).reviewer
    harshest    = withAvgs.reduce((a, b) => (a.avg < b.avg ? a : b)).reviewer
  }
  return { reviewers: sorted, mostGenerous, harshest }
}

// 6. Reviewer Disagreement — drinks with widest spread between sisters
export function reviewerDisagreement(drinks) {
  return drinks
    .map(d => {
      const scored = reviewerScores(d)
      if (scored.length < 2) return null
      const nums = scored.map(x => x.score)
      return {
        drink: d,
        spread: Math.max(...nums) - Math.min(...nums),
        scores: scored,
      }
    })
    .filter(Boolean)
    .sort((a, b) =>
      b.spread - a.spread ||
      a.drink.brand.localeCompare(b.drink.brand)
    )
}

// 7. Rating Distribution — histogram of integer-rounded overall ratings
export function ratingDistribution(drinks) {
  const buckets = new Map()
  for (const d of drinks) {
    const r = d.ratings.overall
    if (r == null) continue
    const bucket = Math.round(r)
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
  }
  return [...buckets.entries()]
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating)
}