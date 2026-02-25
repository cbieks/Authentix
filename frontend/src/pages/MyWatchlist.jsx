import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './MyWatchlist.css'

export default function MyWatchlist() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api('/api/users/me/watchlist')
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function remove(e, id) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api(`/api/listings/${id}/watchlist`, { method: 'DELETE' })
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      console.error('Failed to remove from watchlist', err)
    }
  }

  if (loading) return <div className="layout-main"><p>Loading…</p></div>
  return (
    <div className="watchlist-page">
      <h1>My watchlist</h1>
      {listings.length === 0 ? (
        <p className="watchlist-empty">Nothing saved yet. Browse <Link to="/explore">Explore</Link> and click Save on listings you like.</p>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card watchlist-card">
              <Link to={`/listings/${listing.id}`} className="listing-card-link">
                <div className="listing-card-image">
                  {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt="" />
                  ) : (
                    <span className="listing-card-placeholder">No image</span>
                  )}
                </div>
                <div className="listing-card-body">
                  <span className="listing-card-price">${Number(listing.price).toFixed(2)}</span>
                  <h3 className="listing-card-title">{listing.title}</h3>
                  <p className="listing-card-meta">{listing.categoryName}</p>
                </div>
              </Link>
              <button type="button" className="watchlist-remove" onClick={(e) => remove(e, listing.id)} aria-label="Remove from watchlist">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
