import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './MyListings.css'

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/listings/me')
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [])

  async function setStatus(id, status) {
    try {
      await api(`/api/listings/${id}/status?status=${status}`, { method: 'PATCH' })
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    } catch (e) {
      alert(e.message)
    }
  }

  async function remove(id) {
    if (!confirm('Remove this listing?')) return
    try {
      await api(`/api/listings/${id}`, { method: 'DELETE' })
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <div className="my-listings-page">
      <div className="my-listings-header">
        <h1>My listings</h1>
        <Link to="/listings/new" className="my-listings-new">+ New listing</Link>
      </div>
      {listings.length === 0 ? (
        <p className="my-listings-empty">You have no listings. <Link to="/listings/new">Create one</Link>.</p>
      ) : (
        <ul className="my-listings-list">
          {listings.map((listing) => (
            <li key={listing.id} className="my-listings-item">
              <div className="my-listings-item-image">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt="" />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <div className="my-listings-item-body">
                <Link to={`/listings/${listing.id}`} className="my-listings-item-title">{listing.title}</Link>
                <p className="my-listings-item-meta">${Number(listing.price).toFixed(2)} · {listing.status}</p>
                <div className="my-listings-item-actions">
                  {listing.status === 'DRAFT' && (
                    <button type="button" onClick={() => setStatus(listing.id, 'ACTIVE')}>Publish</button>
                  )}
                  {listing.status === 'ACTIVE' && (
                    <button type="button" onClick={() => setStatus(listing.id, 'DRAFT')}>Unpublish</button>
                  )}
                  <Link to={`/listings/${listing.id}/edit`}>Edit</Link>
                  <button type="button" className="my-listings-remove" onClick={() => remove(listing.id)}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
