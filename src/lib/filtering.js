// src/lib/filtering.js

export const SORT_OPTIONS = [
  { value: 'rating-desc',  label: 'Rating (high → low)' },
  { value: 'rating-asc',   label: 'Rating (low → high)' },
  { value: 'brand',        label: 'Brand (A → Z)' },
  { value: 'flavor',       label: 'Flavor (A → Z)' },
  { value: 'abv-desc',     label: 'ABV (high → low)' },
  { value: 'cal-asc',      label: 'Calories (low → high)' },
]

export function applyFilters(drinks, { search, type, tag, brand, sort }) {
  let out = drinks

  if (search) {
    const q = search.toLowerCase()
    out = out.filter(d =>
      (d.brand  || '').toLowerCase().includes(q) ||
      (d.flavor || '').toLowerCase().includes(q) ||
      (d.notes  || '').toLowerCase().includes(q)
    )
  }

  if (type && type !== 'All') {
    out = out.filter(d => d.type === type)
  }

  if (tag) {
    out = out.filter(d => d.tags.includes(tag))
  }

  if (brand) {
    out = out.filter(d => d.brand === brand)
  }

  out = [...out].sort((a, b) => {
    switch (sort) {
      case 'rating-desc':
        return cmpNullsLast(a.ratings.overall, b.ratings.overall, 'desc') || cmpStr(a.brand, b.brand)
      case 'rating-asc':
        return cmpNullsLast(a.ratings.overall, b.ratings.overall, 'asc')  || cmpStr(a.brand, b.brand)
      case 'brand':
        return cmpStr(a.brand,  b.brand)  || cmpStr(a.flavor, b.flavor)
      case 'flavor':
        return cmpStr(a.flavor, b.flavor) || cmpStr(a.brand,  b.brand)
      case 'abv-desc':
        return cmpNullsLast(a.abv, b.abv, 'desc') || cmpStr(a.brand, b.brand)
      case 'cal-asc':
        return cmpNullsLast(a.calories, b.calories, 'asc') || cmpStr(a.brand, b.brand)
      default:
        return 0
    }
  })

  return out
}

// Numeric compare. null values ALWAYS go to the end, regardless of direction.
function cmpNullsLast(va, vb, dir) {
  if (va == null && vb == null) return 0
  if (va == null) return 1
  if (vb == null) return -1
  return dir === 'desc' ? vb - va : va - vb
}

function cmpStr(a, b) {
  return (a || '').localeCompare(b || '', undefined, { sensitivity: 'base' })
}

export function uniqueTypes(drinks) {
  const set = new Set(drinks.map(d => d.type).filter(Boolean))
  return ['All', ...[...set].sort()]
}

export function uniqueTags(drinks) {
  const set = new Set()
  drinks.forEach(d => d.tags.forEach(t => set.add(t)))
  return [...set].sort()
}

export function uniqueBrands(drinks) {
  const set = new Set(drinks.map(d => d.brand).filter(Boolean))
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}