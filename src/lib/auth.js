// src/lib/auth.js
// Soft password gate using SHA-256.
// Note: this is NOT cryptographically secure auth — anyone who views
// page source can see the hash and brute force it. It's enough to
// keep casual visitors out of the family's seltzer reviews.

const PASSWORD_HASH =
  '796d939f9d289ed0312e33e1d8d00c8604e1b321159ea924434a66e634d13192'

const STORAGE_KEY = 'klaw_authed'

async function sha256(str) {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkPassword(input) {
  const hash = await sha256(input)
  return hash === PASSWORD_HASH
}

export function isAuthed() {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function setAuthed() {
  localStorage.setItem(STORAGE_KEY, '1')
}

export function clearAuthed() {
  localStorage.removeItem(STORAGE_KEY)
}