import { useEffect, useMemo, useState } from 'react'
import { fetchDrinks } from './lib/sheets'
import { isAuthed } from './lib/auth'
import Login from './components/Login'
import ListView from './components/ListView'
import StatsView from './components/StatsView'
import DrinkForm from './components/DrinkForm'

function App() {
  const [authed, setAuthed]   = useState(() => isAuthed())
  const [drinks, setDrinks]   = useState(null)
  const [error, setError]     = useState(null)
  const [view, setView]       = useState('list')
  const [pendingFilter, setPendingFilter] = useState(null)
  const [formMode, setFormMode] = useState(null) // null | 'add' | 'edit'
  const [editDrink, setEditDrink] = useState(null)
  const [sunMode, setSunMode] = useState(
    () => localStorage.getItem('klaw_sun_mode') === '1'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('sun', sunMode)
    localStorage.setItem('klaw_sun_mode', sunMode ? '1' : '0')
  }, [sunMode])

  useEffect(() => {
    if (!authed) return
    fetchDrinks().then(setDrinks).catch(err => setError(err.message))
  }, [authed])

  const knownTypes = useMemo(() => {
    if (!drinks) return []
    const s = new Set(drinks.map(d => d.type).filter(Boolean))
    return [...s].sort()
  }, [drinks])

  const goToList = (filter) => {
    setPendingFilter(filter ?? {})
    setView('list')
  }

  const handleAdd = () => {
    setEditDrink(null)
    setFormMode('add')
  }

  const handleEdit = (drink) => {
    setEditDrink(drink)
    setFormMode('edit')
  }

  const handleFormClose = () => {
    setFormMode(null)
    setEditDrink(null)
  }

  const handleFormSaved = async () => {
    setFormMode(null)
    setEditDrink(null)
    // Refetch to get the new/updated row
    try {
      const fresh = await fetchDrinks()
      setDrinks(fresh)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div
        className={`${view === 'stats' ? 'max-w-6xl' : 'max-w-3xl'} mx-auto rounded-2xl p-5 sm:p-8 transition-[max-width] duration-200`}
        style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
      >
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            KLaW Reviews
          </h1>
          <div className="flex items-center gap-2">
            {drinks && (
              <button
                onClick={handleAdd}
                className="rounded-full w-11 h-11 flex items-center justify-center transition active:scale-95 text-white text-2xl font-bold"
                style={{ background: 'var(--accent-primary)' }}
                aria-label="Add a drink"
                title="Add a drink"
              >
                +
              </button>
            )}
            <button
              onClick={() => setSunMode(s => !s)}
              className="text-2xl rounded-full w-11 h-11 flex items-center justify-center transition active:scale-95"
              style={{
                background: 'var(--bg-from)',
                border: '1px solid var(--divider)',
              }}
              aria-label={sunMode ? 'Switch to indoor mode' : 'Switch to sun mode'}
              title={sunMode ? 'Switch to indoor mode' : 'Switch to sun mode'}
            >
              {sunMode ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {drinks && (
          <div
            className="flex rounded-full p-1 mb-5 w-full sm:w-64"
            style={{ background: 'var(--bg-from)', border: '1px solid var(--divider)' }}
          >
            {['list', 'stats'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex-1 py-2 rounded-full text-sm font-semibold capitalize transition active:scale-95"
                style={{
                  background: view === v ? 'var(--accent-primary)' : 'transparent',
                  color: view === v ? 'white' : 'var(--text-muted)',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            <p className="font-bold mb-1">Error loading data:</p>
            <p className="text-sm font-mono break-all">{error}</p>
          </div>
        )}
        {!error && !drinks && (
          <p style={{ color: 'var(--text-muted)' }}>Loading drinks…</p>
        )}
        {drinks && view === 'list' && (
          <ListView
            drinks={drinks}
            pendingFilter={pendingFilter}
            onFilterApplied={() => setPendingFilter(null)}
            onEditDrink={handleEdit}
          />
        )}
        {drinks && view === 'stats' && (
          <StatsView drinks={drinks} goToList={goToList} />
        )}
      </div>

      {formMode && (
        <DrinkForm
          mode={formMode}
          drink={editDrink}
          knownTypes={knownTypes}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  )
}

export default App