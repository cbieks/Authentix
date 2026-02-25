import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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
