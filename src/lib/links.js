// src/lib/links.js
export function totalWineUrl(brand, flavor) {
  const q = encodeURIComponent(`${brand} ${flavor}`.trim())
  return `https://www.totalwine.com/search/all?text=${q}`
}

export function googleUrl(brand, flavor) {
  const q = encodeURIComponent(`${brand} ${flavor} seltzer`.trim())
  return `https://www.google.com/search?q=${q}`
}