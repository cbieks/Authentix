import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDiscoveryZip } from '../context/DiscoveryZipContext'
import { api } from '../api/client'
import Footer from './Footer'

const CART_STORAGE_KEY = 'shopping_cart_v1'

function readCartCount() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return 0
    return parsed.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
  } catch {
    return 0
  }
}

export default function Layout({ children }) {
  const { user, logout, refetchUser } = useAuth()
  const { guestZip, setGuestZip } = useDiscoveryZip()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [zipMenuOpen, setZipMenuOpen] = useState(false)
  const [zipInput, setZipInput] = useState('')
  const [zipCountry, setZipCountry] = useState('US')
  const [zipSaving, setZipSaving] = useState(false)
  const [zipClearedOptimistic, setZipClearedOptimistic] = useState(false)
  const [cartCount, setCartCount] = useState(readCartCount())
  const zipMenuRef = useRef(null)

  const resolvedZip = user ? (user.discoveryZipCode ?? '') : (guestZip ?? '')
  const currentZip = zipClearedOptimistic ? '' : resolvedZip

  useEffect(() => {
    function syncCart() {
      setCartCount(readCartCount())
    }

    syncCart()
    window.addEventListener('storage', syncCart)
    window.addEventListener('cart:updated', syncCart)
    return () => {
      window.removeEventListener('storage', syncCart)
      window.removeEventListener('cart:updated', syncCart)
    }
  }, [])

  useEffect(() => {
    if (zipMenuOpen) {
      setZipClearedOptimistic(false)
      setZipInput(user ? (user.discoveryZipCode ?? '') : (guestZip ?? ''))
      setZipCountry(user?.discoveryCountry || 'US')
    }
  }, [zipMenuOpen, user, guestZip])

  useEffect(() => {
    if (resolvedZip?.trim()) setZipClearedOptimistic(false)
  }, [resolvedZip])

  useEffect(() => {
    if (!zipMenuOpen) return
    function handleClickOutside(e) {
      if (zipMenuRef.current && !zipMenuRef.current.contains(e.target)) {
        setZipMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [zipMenuOpen])

  function handleLogout() {
    logout()
    navigate('/')
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    const q = searchQuery?.trim()
    if (q) navigate(`/explore?q=${encodeURIComponent(q)}`)
    else navigate('/explore')
  }

  async function handleZipSave() {
    const zip = zipInput?.trim() || ''
    setZipSaving(true)
    try {
      if (user) {
        await api('/api/users/me/discovery-location', {
          method: 'PUT',
          body: JSON.stringify({
            zipCode: zip,
            country: (zipCountry || 'US').toUpperCase().slice(0, 2),
          }),
        })
        await refetchUser()
      } else {
        setGuestZip(zip)
      }
      setZipMenuOpen(false)
    } catch {
      // ignore
    }
    setZipSaving(false)
  }

  async function handleZipClear() {
    setZipClearedOptimistic(true)
    setZipInput('')
    setZipMenuOpen(false)
    setZipSaving(true)
    try {
      setGuestZip('')
      if (user) {
        await api('/api/users/me/discovery-location', {
          method: 'PUT',
          body: JSON.stringify({ zipCode: '', country: (zipCountry || 'US').toUpperCase().slice(0, 2) }),
        })
        await refetchUser()
      }
    } catch {
      // ignore
    }
    setZipSaving(false)
  }

  const navLinkClass = 'text-sm font-medium text-slate-300 transition hover:text-white'
  const actionButtonClass = 'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a5f] text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(30,27,75,0.88)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-6 lg:px-6">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <Link to="/" className="text-[1.35rem] font-bold tracking-tight text-white hover:text-indigo-200">
              Authentix
            </Link>

            <div className="lg:hidden">
              <Link to="/cart" className={actionButtonClass}>
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-bold text-slate-900">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <form className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 shadow-sm lg:max-w-[640px] lg:flex-1" onSubmit={handleSearchSubmit} role="search">
            <span className="text-base text-slate-300" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              className="w-full bg-transparent py-1 text-sm text-white outline-none placeholder:text-slate-400"
              placeholder="Search collectibles, brands, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search collectibles"
            />
          </form>

          <nav className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="relative" ref={zipMenuRef}>
              <button
                type="button"
                className={actionButtonClass}
                onClick={() => setZipMenuOpen((o) => !o)}
                aria-expanded={zipMenuOpen}
                aria-haspopup="dialog"
                aria-label={currentZip ? `ZIP code: ${currentZip}. Click to change.` : 'Set location. Click to enter ZIP code.'}
              >
                <span aria-hidden>
                  <svg width="16" height="20" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18C24 5.373 18.627 0 12 0z" fill="#fff" />
                    <circle cx="12" cy="12" r="5" fill="#312e81" />
                  </svg>
                </span>
                <span className="max-w-[110px] truncate">{currentZip || 'Set location'}</span>
              </button>

              {zipMenuOpen && (
                <div className="absolute right-0 top-full z-[1001] mt-2 w-[280px] rounded-2xl border border-white/10 bg-[#312e81] p-4 shadow-2xl">
                  <label className="block text-sm text-slate-300">
                    ZIP / postal code
                    <input
                      type="text"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      placeholder="e.g. 90210"
                      maxLength={20}
                      autoFocus
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-white/20"
                    />
                  </label>

                  {user && (
                    <label className="mt-3 block text-sm text-slate-300">
                      Country
                      <input
                        type="text"
                        value={zipCountry}
                        onChange={(e) => setZipCountry(e.target.value)}
                        placeholder="US"
                        maxLength={2}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-white/20"
                      />
                    </label>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    {currentZip ? (
                      <button
                        type="button"
                        className="mr-auto rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
                        onClick={handleZipClear}
                        disabled={zipSaving}
                      >
                        Clear
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:text-white"
                      onClick={() => setZipMenuOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={handleZipSave}
                      disabled={zipSaving}
                    >
                      {zipSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link to="/explore" className={navLinkClass}>
              Explore
            </Link>
            <Link to="/cart" className={`${navLinkClass} inline-flex items-center gap-2`}>
              Cart
              {cartCount > 0 && (
                <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-bold text-slate-900">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link to="/account" className={navLinkClass}>
                  Account
                </Link>
                <Link to="/account/listings" className={navLinkClass}>
                  My listings
                </Link>
                <Link to="/account/watchlist" className={navLinkClass}>
                  Watchlist
                </Link>
                <Link to="/account/inbox" className={navLinkClass}>
                  Inbox
                </Link>
                <button type="button" className={`${navLinkClass} bg-transparent p-0`} onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>
                  Sign in
                </Link>
                <Link to="/register" className={navLinkClass}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-4 lg:px-6">{children}</div>
        <Footer />
      </main>
    </div>
  )
}
