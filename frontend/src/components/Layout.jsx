import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="logo">Authentix</Link>
        <nav>
          <Link to="/explore">Explore</Link>
          {user ? (
            <>
              <Link to="/account">Account</Link>
              <Link to="/account/listings">My listings</Link>
              <Link to="/account/watchlist">Watchlist</Link>
              <Link to="/account/inbox">Inbox</Link>
              <Link to="/admin/verification">Admin</Link>
              <button type="button" className="link-button" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Sign up</Link>
            </>
          )}
        </nav>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  )
}
