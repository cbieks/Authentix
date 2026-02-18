import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { AdSlot } from '../components/Analytics'
import './Explorer.css'

export default function Explorer() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [recommended, setRecommended] = useState([])
  const [watchlistIds, setWatchlistIds] = useState(new Set())
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [shippingOption, setShippingOption] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    api('/api/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) {
      api('/api/users/me/watchlist')
        .then((list) => setWatchlistIds(new Set((list || []).map((l) => l.id))))
        .catch(() => setWatchlistIds(new Set()))
    } else {
      setWatchlistIds(new Set())
    }
  }, [user])

  useEffect(() => {
    api('/api/listings/recommended')
      .then((list) => setRecommended(list || []))
      .catch(() => setRecommended([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), size: '12' })
    if (categoryId) params.set('categoryId', categoryId)
    if (shippingOption) params.set('shippingOption', shippingOption)
    api(`/api/listings?${params}`)
      .then((data) => {
        setListings(data.content || [])
        setTotalPages(data.totalPages ?? 0)
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [categoryId, shippingOption, page])

  async function toggleWatchlist(e, listingId) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    const watched = watchlistIds.has(listingId)
    try {
      if (watched) {
        await api(`/api/listings/${listingId}/watchlist`, { method: 'DELETE' })
        setWatchlistIds((prev) => { const s = new Set(prev); s.delete(listingId); return s })
      } else {
        await api(`/api/listings/${listingId}/watchlist`, { method: 'POST' })
        setWatchlistIds((prev) => new Set([...prev, listingId]))
      }
    } catch (err) {}
  }

  const showRecommended = !categoryId && page === 0 && recommended.length > 0
  return (
    <div className="explorer-page">
      <h1>Explore</h1>
      <div className="explorer-toolbar">
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0) }}
          className="explorer-category-select"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={shippingOption}
          onChange={(e) => { setShippingOption(e.target.value); setPage(0) }}
          className="explorer-category-select"
        >
          <option value="">All shipping</option>
          <option value="SHIP">Shipping</option>
          <option value="LOCAL_PICKUP">Local pickup</option>
        </select>
      </div>
      {showRecommended && (
        <section className="explorer-recommended">
          <h2>Recommended for you</h2>
          <div className="listing-grid">
            {recommended.slice(0, 8).map((listing) => (
              <Link key={listing.id} to={`/listings/${listing.id}`} className="listing-card">
                <div className="listing-card-image">
                  {listing.images?.[0] ? <img src={listing.images[0]} alt="" /> : <span className="listing-card-placeholder">No image</span>}
                </div>
                <div className="listing-card-body">
                  <span className="listing-card-price">${Number(listing.price).toFixed(2)}</span>
                  <h3 className="listing-card-title">{listing.title}</h3>
                  <p className="listing-card-meta">{listing.categoryName}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      <div className="explorer-ad">
        <AdSlot slotId="1234567890" className="explorer-ad-slot" />
      </div>
      {loading ? (
        <p className="explorer-loading">Loading…</p>
      ) : listings.length === 0 ? (
        <p className="explorer-empty">No listings yet. Be the first to list something!</p>
      ) : (
        <>
          <div className="listing-grid">
            {listings.map((listing) => (
              <div key={listing.id} className="listing-card-wrapper">
                <Link to={`/listings/${listing.id}`} className="listing-card">
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
                    <p className="listing-card-meta">{listing.categoryName} · {listing.condition || '—'}</p>
                  </div>
                </Link>
                {user && (
                  <button
                    type="button"
                    className={`explorer-watchlist-btn ${watchlistIds.has(listing.id) ? 'saved' : ''}`}
                    onClick={(e) => toggleWatchlist(e, listing.id)}
                    aria-label={watchlistIds.has(listing.id) ? 'Remove from watchlist' : 'Save to watchlist'}
                    title={watchlistIds.has(listing.id) ? 'Remove from watchlist' : 'Save'}
                  >
                    {watchlistIds.has(listing.id) ? '♥' : '♡'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="explorer-pagination">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
