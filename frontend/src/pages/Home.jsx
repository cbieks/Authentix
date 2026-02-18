import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Authentix</h1>
        <p>Collectibles marketplace — Lego, trading cards, antiques & more.</p>
        <p>
          <Link to="/explore" className="home-cta">Browse listings</Link>
          {user && (
            <> · <Link to="/listings/new">Sell an item</Link></>
          )}
        </p>
        {user ? (
          <p className="home-meta">
            Signed in as <strong>{user.displayName || user.email}</strong>.{' '}
            <Link to="/account">Account</Link> · <Link to="/account/listings">My listings</Link>
          </p>
        ) : (
          <p className="home-meta">
            <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to list and buy.
          </p>
        )}
      </div>
    </div>
  )
}
