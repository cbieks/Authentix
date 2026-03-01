import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDiscoveryZip } from '../context/DiscoveryZipContext'
import { api } from '../api/client'
import './Layout.css'

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
  const zipMenuRef = useRef(null)

  const resolvedZip = user ? (user.discoveryZipCode ?? '') : (guestZip ?? '')
  const currentZip = zipClearedOptimistic ? '' : resolvedZip

  useEffect(() => {
    if (zipMenuOpen) {
      setZipClearedOptimistic(false)
      setZipInput(user ? (user.discoveryZipCode ?? '') : (guestZip ?? ''))
      setZipCountry(user?.discoveryCountry || 'US')
    }
  }, [zipMenuOpen, user, user?.discoveryZipCode, user?.discoveryCountry, guestZip])

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
    } catch (_) {}
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
    } catch (_) {}
    setZipSaving(false)
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <Link to="/" className="layout-logo">Authentix</Link>

          <form className="layout-search-form" onSubmit={handleSearchSubmit} role="search">
            <span className="layout-search-icon" aria-hidden>⌕</span>
            <input
              type="search"
              className="layout-search-input"
              placeholder="Search collectibles, brands, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search collectibles"
            />
          </form>

          <nav className="layout-nav">
            <div className="layout-zip-wrap" ref={zipMenuRef}>
              <button
                type="button"
                className="layout-zip-btn"
                onClick={() => setZipMenuOpen((o) => !o)}
                aria-expanded={zipMenuOpen}
                aria-haspopup="dialog"
                aria-label={currentZip ? `ZIP code: ${currentZip}. Click to change.` : 'Set location. Click to enter ZIP code.'}
              >
                <span className="layout-zip-icon" aria-hidden>
                  <svg width="16" height="20" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 18 12 18s12-9 12-18C24 5.373 18.627 0 12 0z" fill="#fff"/>
                    <circle cx="12" cy="12" r="5" fill="var(--brand-bg-mid, #312e81)"/>
                  </svg>
                </span>
                <span className="layout-zip-label">{currentZip || 'Set location'}</span>
              </button>
              {zipMenuOpen && (
                <div className="layout-zip-dropdown" role="dialog" aria-label="Change ZIP code">
                  <label className="layout-zip-dropdown-label">
                    ZIP / postal code
                    <input
                      type="text"
                      value={zipInput}
                      onChange={(e) => setZipInput(e.target.value)}
                      placeholder="e.g. 90210"
                      maxLength={20}
                      autoFocus
                    />
                  </label>
                  {user && (
                    <label className="layout-zip-dropdown-label">
                      Country
                      <input
                        type="text"
                        value={zipCountry}
                        onChange={(e) => setZipCountry(e.target.value)}
                        placeholder="US"
                        maxLength={2}
                      />
                    </label>
                  )}
                  <div className="layout-zip-dropdown-actions">
                    {currentZip ? (
                      <button type="button" className="layout-zip-dropdown-clear" onClick={handleZipClear} disabled={zipSaving}>
                        Clear
                      </button>
                    ) : null}
                    <button type="button" className="layout-zip-dropdown-cancel" onClick={() => setZipMenuOpen(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="layout-zip-dropdown-save"
                      onClick={handleZipSave}
                      disabled={zipSaving}
                    >
                      {zipSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to="/explore">Explore</Link>
            {user ? (
              <>
                <Link to="/account">Account</Link>
                <Link to="/account/listings">My listings</Link>
                <Link to="/account/watchlist">Watchlist</Link>
                <Link to="/account/inbox">Inbox</Link>
                <button type="button" className="layout-link-button" onClick={handleLogout}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login">Sign in</Link>
                <Link to="/register">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  )
}
