import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import CheckoutForm from '../components/CheckoutForm'
import './ListingDetail.css'

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePk ? loadStripe(stripePk) : null

export default function ListingDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [watched, setWatched] = useState(false)
  const [similar, setSimilar] = useState([])
  const [messageText, setMessageText] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const paymentSuccess = searchParams.get('payment') === 'success'

  const images = listing?.images ?? []
  const hasMultipleImages = images.length > 1
  const goPrevImage = () => setImageViewerIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
  const goNextImage = () => setImageViewerIndex((i) => (i >= images.length - 1 ? 0 : i + 1))

  const refetch = () => {
    return api(`/api/listings/${id}`)
      .then(setListing)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    refetch().finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (paymentSuccess) {
      refetch()
      setSearchParams({}, { replace: true })
    }
  }, [paymentSuccess])

  useEffect(() => {
    if (user && listing) {
      api(`/api/listings/${listing.id}/watchlist`)
        .then((d) => setWatched(d.watched === true))
        .catch(() => setWatched(false))
    } else {
      setWatched(false)
    }
  }, [user, listing?.id])

  useEffect(() => {
    if (listing?.id) {
      api(`/api/listings/recommended?listingId=${listing.id}`)
        .then(setSimilar)
        .catch(() => setSimilar([]))
    }
  }, [listing?.id])

  useEffect(() => {
    if (!imageViewerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setImageViewerOpen(false)
      if (e.key === 'ArrowLeft') goPrevImage()
      if (e.key === 'ArrowRight') goNextImage()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [imageViewerOpen, images.length])

  async function toggleWatchlist() {
    if (!user || !listing) return
    try {
      if (watched) {
        await api(`/api/listings/${listing.id}/watchlist`, { method: 'DELETE' })
        setWatched(false)
      } else {
        await api(`/api/listings/${listing.id}/watchlist`, { method: 'POST' })
        setWatched(true)
      }
    } catch (e) {}
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!messageText.trim() || messageSending) return
    setMessageSending(true)
    try {
      await api(`/api/listings/${listing.id}/message`, { method: 'POST', body: JSON.stringify({ body: messageText.trim() }) })
      setMessageSent(true)
      setMessageText('')
    } catch (e) {}
    setMessageSending(false)
  }

  const isOwnListing = user && listing && listing.sellerId === user.id
  const canBuy = user && listing && listing.status === 'ACTIVE' && !isOwnListing && listing.sellerPayoutsEnabled

  async function handleBuyClick() {
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const data = await api('/api/orders/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ listingId: listing.id }),
      })
      setClientSecret(data.clientSecret)
      setCheckoutOpen(true)
    } catch (err) {
      setCheckoutError(err.message || 'Could not start checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  function closeCheckout() {
    setCheckoutOpen(false)
    setClientSecret(null)
    setCheckoutError(null)
  }

  if (loading) return <div className="layout-main"><p>Loading…</p></div>
  if (error) return <div className="layout-main"><p className="listing-detail-error">{error}</p></div>
  if (!listing) return null

  return (
    <div className="listing-detail-page">
      <div className="listing-detail-main">
        <div
          className={`listing-detail-gallery ${images.length > 0 ? 'clickable' : ''}`}
          onClick={() => {
            if (images.length > 0) {
              setImageViewerIndex(0)
              setImageViewerOpen(true)
            }
          }}
          role={images.length > 0 ? 'button' : undefined}
          aria-label={images.length > 0 ? 'View photos' : undefined}
        >
          {images.length > 0 ? (
            <img src={images[0]} alt="" />
          ) : (
            <div className="listing-detail-no-image">No image</div>
          )}
        </div>
        {imageViewerOpen && images.length > 0 && (
          <div
            className="listing-detail-image-viewer-overlay"
            onClick={() => setImageViewerOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <div className="listing-detail-image-viewer" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="listing-detail-image-viewer-close" onClick={() => setImageViewerOpen(false)} aria-label="Close">×</button>
              {hasMultipleImages && (
                <button type="button" className="listing-detail-image-viewer-arrow left" onClick={goPrevImage} aria-label="Previous photo">←</button>
              )}
              <img src={images[imageViewerIndex]} alt="" />
              {hasMultipleImages && (
                <button type="button" className="listing-detail-image-viewer-arrow right" onClick={goNextImage} aria-label="Next photo">→</button>
              )}
              {hasMultipleImages && (
                <span className="listing-detail-image-viewer-counter">{imageViewerIndex + 1} / {images.length}</span>
              )}
            </div>
          </div>
        )}
        <div className="listing-detail-info">
          <span className="listing-detail-category">{listing.categoryName}</span>
          <h1>{listing.title}</h1>
          <p className="listing-detail-price">${Number(listing.price).toFixed(2)}</p>
          {listing.status === 'SOLD' && <span className="listing-detail-badge listing-detail-badge-sold">Sold</span>}
          {listing.condition && <p><strong>Condition:</strong> {listing.condition}</p>}
          <p><strong>Shipping:</strong> {listing.shippingOption === 'SHIP' ? 'Shipping' : 'Local pickup'}</p>
          {paymentSuccess && <p className="listing-detail-payment-success">Payment successful! This item is sold.</p>}
          {canBuy && (
            <div className="listing-detail-buy">
              <button type="button" className="listing-detail-buy-btn" onClick={handleBuyClick} disabled={checkoutLoading || !stripePromise}>
                {checkoutLoading ? 'Preparing…' : 'Buy now'}
              </button>
              {!stripePromise && <p className="listing-detail-buy-hint">Checkout is not configured (missing VITE_STRIPE_PUBLISHABLE_KEY).</p>}
              {checkoutError && <p className="listing-detail-error">{checkoutError}</p>}
            </div>
          )}
          {user && listing.status === 'ACTIVE' && !isOwnListing && !listing.sellerPayoutsEnabled && (
            <p className="listing-detail-no-payouts">Seller has not set up payouts; purchase is not available.</p>
          )}
          {user && (
            <div className="listing-detail-watchlist">
              <button
                type="button"
                className={`listing-detail-watchlist-btn ${watched ? 'saved' : ''}`}
                onClick={toggleWatchlist}
                title={watched ? 'Remove from watchlist' : 'Save to watchlist'}
                aria-label={watched ? 'Remove from watchlist' : 'Save to watchlist'}
              >
                {watched ? '♥ Saved (click to remove)' : '♡ Save'}
              </button>
            </div>
          )}
          {user && !isOwnListing && listing.status === 'ACTIVE' && (
            <div className="listing-detail-message">
              <h3>Ask the seller</h3>
              {messageSent ? (
                <p className="listing-detail-message-sent">Message sent. The seller will see it in their Inbox.</p>
              ) : (
                <form onSubmit={sendMessage}>
                  <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Your question..." rows={3} maxLength={1000} />
                  <button type="submit" disabled={messageSending || !messageText.trim()}>{messageSending ? 'Sending…' : 'Send message'}</button>
                </form>
              )}
            </div>
          )}
          <div className="listing-detail-description">
            <h3>Description</h3>
            <p>{listing.description || 'No description.'}</p>
          </div>
        </div>
      </div>
      <div className="listing-detail-sidebar">
        <div className="listing-detail-seller">
          <h3>Seller</h3>
          <Link to={`/users/${listing.sellerId}`} className="listing-detail-seller-card">
            {listing.sellerProfilePhotoUrl && (
              <img src={listing.sellerProfilePhotoUrl} alt="" className="listing-detail-seller-photo" />
            )}
            <span className="listing-detail-seller-name">{listing.sellerDisplayName || 'Seller'}</span>
          </Link>
        </div>
        <p className="listing-detail-back"><Link to="/explore">← Back to explore</Link></p>
      </div>

      {similar.length > 0 && (
        <section className="listing-detail-similar">
          <h2>Similar listings</h2>
          <div className="listing-detail-similar-grid">
            {similar.map((l) => (
              <Link key={l.id} to={`/listings/${l.id}`} className="listing-detail-similar-card">
                {l.images?.[0] ? <img src={l.images[0]} alt="" /> : <span>No image</span>}
                <span className="listing-detail-similar-price">${Number(l.price).toFixed(2)}</span>
                <span className="listing-detail-similar-title">{l.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {checkoutOpen && clientSecret && stripePromise && (
        <div className="listing-detail-modal-overlay" onClick={closeCheckout}>
          <div className="listing-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Complete payment</h3>
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                listingId={listing.id}
                amount={listing.price}
                onSuccess={closeCheckout}
                onCancel={closeCheckout}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  )
}
