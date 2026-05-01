// src/lib/sheets.js
// Fetches and normalizes the KLaW Reviews sheet, plus add/update via Apps Script.

const API_KEY         = import.meta.env.VITE_GOOGLE_API_KEY
const SHEET_ID        = import.meta.env.VITE_SHEET_ID
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL
const SHEET_TAB       = 'KLaW Reviews'
const RANGE           = `'${SHEET_TAB}'!A1:N`

/**
 * Returns an array of normalized drink objects.
 * Each drink shape:
 * {
 *   brand, flavor, type,
 *   ratings: { overall, kris, laurie, wendy },
 *   calories, abv, thcMg,
 *   tags: [],          // array of '#tag' strings (lowercase)
 *   notes, dateAdded, lastModified,
 *   _row,              // sheet row number (for future edit ops)
 * }
 */
export async function fetchDrinks() {
  if (!API_KEY || !SHEET_ID) {
    throw new Error('Missing VITE_GOOGLE_API_KEY or VITE_SHEET_ID in .env')
  }

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}` +
    `/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Sheets API ${res.status}: ${await res.text()}`)
  }

  const { values = [] } = await res.json()
  if (values.length < 2) return []

  const [headers, ...rows] = values
  const col = (row, name) => row[headers.indexOf(name)] ?? ''

  return rows.map((row, i) => ({
    brand:   col(row, 'Brand'),
    flavor:  col(row, 'Flavor'),
    type:    col(row, 'Type'),
    ratings: {
      overall: toNum(col(row, 'Rating Overall')),
      kris:    toNum(col(row, 'Rating Kris')),
      laurie:  toNum(col(row, 'Rating Laurie')),
      wendy:   toNum(col(row, 'Rating Wendy')),
    },
    calories:     toNum(col(row, 'Calories')),
    abv:          toNum(col(row, 'ABV %')),
    thcMg:        toNum(col(row, 'THC mg')),
    tags:         parseTags(col(row, 'Tags')),
    notes:        col(row, 'Notes'),
    dateAdded:    col(row, 'Date Added'),
    lastModified: col(row, 'Last Modified'),
    _row:         i + 2,
  }))
}

/**
 * Add a new drink. Returns { row } from the sheet on success.
 * Throws on validation or network errors.
 *
 * @param {object} drink — flat object with brand, flavor, type, overall, kris,
 *   laurie, wendy, calories, abv, thcMg, tags (string), notes (string)
 */
export async function addDrink(drink) {
  return postToScript({ op: 'add', drink })
}

/**
 * Update an existing drink by sheet row number. Returns { row }.
 * Throws on validation or network errors.
 */
export async function updateDrink(rowNum, drink) {
  return postToScript({ op: 'update', row: rowNum, drink })
}

async function postToScript(body) {
  if (!APPS_SCRIPT_URL) {
    throw new Error('Missing VITE_APPS_SCRIPT_URL in .env')
  }

  // Apps Script web apps don't accept custom headers without a CORS preflight,
  // and preflights fail because Apps Script doesn't respond to OPTIONS.
  // Workaround: send as text/plain (a "simple" CORS request) with JSON in body.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow',
  })

  if (!res.ok) {
    throw new Error(`Apps Script ${res.status}`)
  }

  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.error || 'Unknown error')
  }
  return data
}

function toNum(v) {
  if (v === null || v === undefined || v === '') return null
  const n = parseFloat(v)
  return Number.isNaN(n) ? null : n
}

function parseTags(s) {
  if (!s) return []
  return s.split(/\s+/).filter(t => t.startsWith('#')).map(t => t.toLowerCase())
}