import { useState } from 'react'
import { checkPassword, setAuthed } from '../lib/auth'

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setChecking(true)
    setError(false)
    const ok = await checkPassword(password)
    setChecking(false)
    if (ok) {
      setAuthed()
      onSuccess()
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🥤</div>
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--accent-primary)' }}
          >
            KLaW Reviews
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2"
            style={{
              background: 'var(--bg-from)',
              border: error ? '2px solid #dc2626' : '1px solid var(--divider)',
              color: 'var(--text-strong)',
            }}
          />

          {error && (
            <p className="text-sm text-red-600 mt-2">Wrong password — try again</p>
          )}

          <button
            type="submit"
            disabled={!password || checking}
            className="w-full mt-4 py-3 rounded-lg font-semibold transition active:scale-[.98] disabled:opacity-50"
            style={{
              background: 'var(--accent-primary)',
              color: '#ffffff',
            }}
          >
            {checking ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}