// KLaW Reviews — write API
//
// Web app that handles two operations:
//   - add:    append a new drink row
//   - update: edit an existing row by row number
//
// Both stamp Last Modified. Add also stamps Date Added if blank.
// Returns JSON: { ok: true, row: <number> } or { ok: false, error: "..." }
//
// NOTE: this script is CONTAINER-BOUND to the KLaW Reviews spreadsheet — it
// uses getActiveSpreadsheet(), which only works for a bound script. Find it
// via the sheet's Extensions > Apps Script, not script.google.com.

const SHEET_NAME = 'KLaW Reviews'

// Column letters in the sheet (1-indexed positions)
// A=Brand, B=Flavor, C=Type, D=Rating Overall, E=Rating Kris,
// F=Rating Laurie, G=Rating Wendy, H=Calories, I=ABV %,
// J=THC mg, K=Tags, L=Notes, M=Date Added, N=Last Modified
const COLS = {
  brand:        1,
  flavor:       2,
  type:         3,
  overall:      4,
  kris:         5,
  laurie:       6,
  wendy:        7,
  calories:     8,
  abv:          9,
  thcMg:       10,
  tags:        11,
  notes:       12,
  dateAdded:   13,
  lastModified:14,
}

const TOTAL_COLS = 14

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const op = body.op

    if (op === 'add')    return ok(addDrink(body.drink))
    if (op === 'update') return ok(updateDrink(body.row, body.drink))
    return err('Unknown operation: ' + op)
  } catch (ex) {
    return err(ex.message || String(ex))
  }
}

function addDrink(d) {
  validate(d)
  const sheet = getSheet()
  const now = new Date()

  const row = []
  row[COLS.brand        - 1] = d.brand
  row[COLS.flavor       - 1] = d.flavor
  row[COLS.type         - 1] = d.type
  row[COLS.overall      - 1] = numOrBlank(d.overall)
  row[COLS.kris         - 1] = numOrBlank(d.kris)
  row[COLS.laurie       - 1] = numOrBlank(d.laurie)
  row[COLS.wendy        - 1] = numOrBlank(d.wendy)
  row[COLS.calories     - 1] = numOrBlank(d.calories)
  row[COLS.abv          - 1] = numOrBlank(d.abv)
  row[COLS.thcMg        - 1] = numOrBlank(d.thcMg)
  row[COLS.tags         - 1] = d.tags || ''
  row[COLS.notes        - 1] = d.notes || ''
  row[COLS.dateAdded    - 1] = now
  row[COLS.lastModified - 1] = now

  sheet.appendRow(row)
  return { row: sheet.getLastRow() }
}

function updateDrink(rowNum, d) {
  validate(d)
  const sheet = getSheet()
  if (rowNum < 2 || rowNum > sheet.getLastRow()) {
    throw new Error('Invalid row number: ' + rowNum)
  }

  // Read current Date Added so we don't overwrite it
  const existingDateAdded = sheet.getRange(rowNum, COLS.dateAdded).getValue()

  const row = []
  row[COLS.brand        - 1] = d.brand
  row[COLS.flavor       - 1] = d.flavor
  row[COLS.type         - 1] = d.type
  row[COLS.overall      - 1] = numOrBlank(d.overall)
  row[COLS.kris         - 1] = numOrBlank(d.kris)
  row[COLS.laurie       - 1] = numOrBlank(d.laurie)
  row[COLS.wendy        - 1] = numOrBlank(d.wendy)
  row[COLS.calories     - 1] = numOrBlank(d.calories)
  row[COLS.abv          - 1] = numOrBlank(d.abv)
  row[COLS.thcMg        - 1] = numOrBlank(d.thcMg)
  row[COLS.tags         - 1] = d.tags || ''
  row[COLS.notes        - 1] = d.notes || ''
  row[COLS.dateAdded    - 1] = existingDateAdded // preserve
  row[COLS.lastModified - 1] = new Date()

  sheet.getRange(rowNum, 1, 1, TOTAL_COLS).setValues([row])
  return { row: rowNum }
}

function validate(d) {
  if (!d) throw new Error('Missing drink data')
  if (!d.brand)  throw new Error('Brand is required')
  if (!d.flavor) throw new Error('Flavor is required')
  if (!d.type)   throw new Error('Type is required')
  if (d.overall == null || d.overall === '') {
    throw new Error('Overall rating is required')
  }
}

function numOrBlank(v) {
  if (v == null || v === '') return ''
  const n = Number(v)
  return isNaN(n) ? '' : n
}

function getSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME)
  return sheet
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ...data }))
    .setMimeType(ContentService.MimeType.JSON)
}

function err(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON)
}
