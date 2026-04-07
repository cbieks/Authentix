import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import CheckoutForm from '../components/CheckoutForm'
import { addCartItem } from '../api/cart'

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePk ? loadStripe(stripePk) : null
const CART_STORAGE_KEY = 'shopping_cart_v1'

function readCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new CustomEvent('cart:updated'))
}

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
  const [messageText, setMessageText] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addressStep, setAddressStep] = useState(false)

  const [cartToast, setCartToast] = useState('')

  const paymentSuccess = searchParams.get('payment') === 'success'
  const images = useMemo(() => listing?.images ?? [], [listing])
  const hasMultipleImages = images.length > 1
  const currentImage = images[imageViewerIndex] || images[0]

  const goPrevImage = () => setImageViewerIndex((i) => (i <= 0 ? images.length - 1 : i - 1))
  const goNextImage = () => setImageViewerIndex((i) => (i >= images.length - 1 ? 0 : i + 1))

  const refetch = () => api(`/api/listings/${id}`).then(setListing).catch((e) => setError(e.message))

  useEffect(() => {
    refetch().finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (paymentSuccess) {
      refetch()
      setSearchParams({}, { replace: true })
    }
  }, [paymentSuccess, refetch, setSearchParams])

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
    if (!imageViewerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setImageViewerOpen(false)
      if (e.key === 'ArrowLeft' && hasMultipleImages) goPrevImage()
      if (e.key === 'ArrowRight' && hasMultipleImages) goNextImage()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [imageViewerOpen, hasMultipleImages, images.length])

  useEffect(() => {
    if (!cartToast) return
    const timer = window.setTimeout(() => setCartToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [cartToast])

  const isOwnListing = user && listing && listing.sellerId === user.id
  const canBuy = user && listing && listing.status === 'ACTIVE' && !isOwnListing && listing.sellerPayoutsEnabled
  const canAddToCart = listing && listing.status === 'ACTIVE' && !isOwnListing

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
    } catch {
      // ignore
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!messageText.trim() || messageSending) return
    setMessageSending(true)
    try {
      await api(`/api/listings/${listing.id}/message`, {
        method: 'POST',
        body: JSON.stringify({ body: messageText.trim() }),
      })
      setMessageSent(true)
      setMessageText('')
    } catch {
      // ignore
    } finally {
      setMessageSending(false)
    }
  }

  // function addToCart() {
  //   if (!listing) return

  //   const cartItem = {
  //     listingId: listing.id,
  //     title: listing.title,
  //     price: Number(listing.price),
  //     image: listing.images?.[0] || null,
  //     sellerId: listing.sellerId,
  //     quantity: 1,
  //     shippingOption: listing.shippingOption,
  //   }

  //   const cart = readCart()
  //   const existing = cart.find((item) => item.listingId === listing.id)
  //   if (existing) {
  //     existing.quantity = (existing.quantity || 1) + 1
  //     writeCart(cart)
  //     setCartToast('Updated cart quantity')
  //     return
  //   }

  //   writeCart([...cart, cartItem])
  //   setCartToast('Added to cart')
  // }
  async function addToCart() {
    if (!listing) return

    const cartItem = {
      listingId: listing.id,
      title: listing.title,
      price: Number(listing.price),
      image: listing.images?.[0] || null,
      shippingOption: listing.shippingOption,
      quantity: 1,
    }

    await addCartItem(user, cartItem)
    setCartToast('Added to cart')
  }

  async function handleBuyClick() {
    setCheckoutError(null)
    setAddressStep(false)
    setAddresses([])
    setSelectedAddressId(null)

    try {
      const list = await api('/api/addresses')
      const addrs = Array.isArray(list) ? list : []
      setAddresses(addrs)

      if (addrs.length === 0) {
        setCheckoutError('Add a shipping address first. Go to Account → Addresses.')
        return
      }

      const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0]
      setSelectedAddressId(defaultAddr.id)
      setAddressStep(true)
    } catch (err) {
      setCheckoutError(err.message || 'Could not load addresses')
    }
  }

  async function handleConfirmAddressAndPay() {
    if (!selectedAddressId || !listing) return
    setCheckoutError(null)
    setCheckoutLoading(true)
    try {
      const data = await api('/api/orders/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ listingId: listing.id, addressId: selectedAddressId }),
      })
      setClientSecret(data.clientSecret)
      setAddressStep(false)
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

  if (loading) {
    return <div className="layout-main min-h-[60vh] px-4 py-10"><p className="text-sm text-slate-600">Loading…</p></div>
  }

  if (error) {
    return <div className="layout-main px-4 py-10"><p className="text-sm text-red-600">{error}</p></div>
  }

  if (!listing) return null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-4 text-sm text-slate-500">
        <Link to="/explore" className="hover:text-slate-800">
          Electronics &gt; Computers &amp; Accessories &gt; Data Storage &gt; External Solid State Drives
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="min-w-0 space-y-6">
          <section className="grid gap-6 xl:grid-cols-[84px_minmax(0,1fr)]">
            <div className="hidden xl:flex xl:flex-col xl:gap-3">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => {
                    setImageViewerIndex(idx)
                    setImageViewerOpen(true)
                  }}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-slate-400 ${
                    idx === imageViewerIndex ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
                  }`}
                >
                  <img src={src} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                className={`group relative flex w-full items-center justify-center bg-slate-50 ${images.length > 0 ? 'cursor-zoom-in' : 'cursor-default'}`}
                onClick={() => {
                  if (images.length > 0) {
                    setImageViewerIndex(0)
                    setImageViewerOpen(true)
                  }
                }}
                aria-label={images.length > 0 ? 'Open image viewer' : undefined}
              >
                <div className="flex min-h-[420px] w-full items-center justify-center p-4 sm:min-h-[520px] lg:min-h-[620px]">
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={listing.title}
                      className="max-h-[560px] w-full object-contain transition duration-200 group-hover:scale-[1.01]"
                    />
                  ) : (
                    <div className="text-sm text-slate-400">No image</div>
                  )}
                </div>
                {images.length > 0 && (
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
                    Click to fullscreen
                  </div>
                )}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Seller</p>
            <Link to={`/users/${listing.sellerId}`} className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50">
              {listing.sellerProfilePhotoUrl ? (
                <img src={listing.sellerProfilePhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {String(listing.sellerDisplayName || 'S').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold text-slate-900">{listing.sellerDisplayName || 'Seller'}</div>
                <div className="text-sm text-slate-500">View profile</div>
              </div>
            </Link>
          </section>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-4 h-fit">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <span>{listing.categoryName}</span>
              {listing.status === 'SOLD' && <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">Sold</span>}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{listing.title}</h1>
            <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              ${Number(listing.price).toFixed(2)}
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Condition</div>
                <div className="mt-1 text-sm text-slate-900">{listing.condition || 'Not listed'}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Shipping</div>
                <div className="mt-1 text-sm text-slate-900">{listing.shippingOption === 'SHIP' ? 'Shipping' : 'Local pickup'}</div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-sm font-semibold text-slate-900">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{listing.description || 'No description.'}</p>
            </div>

            {paymentSuccess && <p className="mt-4 text-sm font-medium text-emerald-600">Payment successful. This item is sold.</p>}
          </section>

          {canAddToCart && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              {canBuy && (
                <button
                  type="button"
                  className="mb-3 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleBuyClick}
                  disabled={checkoutLoading || !stripePromise}
                >
                  {checkoutLoading ? 'Preparing…' : 'Buy now'}
                </button>
              )}

              {user ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`inline-flex flex-1 items-center justify-center rounded-full border px-4 py-3 text-sm font-medium transition ${
                      watched
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={toggleWatchlist}
                    title={watched ? 'Remove from watchlist' : 'Save to watchlist'}
                    aria-label={watched ? 'Remove from watchlist' : 'Save to watchlist'}
                  >
                    {watched ? '♥ Saved' : '♡ Save'}
                  </button>

                  <button
                    type="button"
                    className="inline-flex flex-[1.4] items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                    onClick={addToCart}
                  >
                    Add to shopping cart
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                  onClick={addToCart}
                >
                  Add to shopping cart
                </button>
              )}

              {!stripePromise && (
                <p className="mt-3 text-sm text-slate-500">
                  Checkout is not configured because VITE_STRIPE_PUBLISHABLE_KEY is missing.
                </p>
              )}
              {checkoutError && <p className="mt-3 text-sm text-red-600">{checkoutError}</p>}
              {user && listing.status === 'ACTIVE' && !isOwnListing && !listing.sellerPayoutsEnabled && (
                <p className="mt-3 text-sm text-slate-500">Seller has not set up payouts; purchase is not available.</p>
              )}
            </section>
          )}

          {user && !isOwnListing && listing.status === 'ACTIVE' && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Ask the seller</h3>
              {messageSent ? (
                <p className="mt-2 text-sm text-emerald-600">Message sent. The seller will see it in their Inbox.</p>
              ) : (
                <form onSubmit={sendMessage} className="mt-3 space-y-3 text-slate-700">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Your question..."
                    rows={4}
                    maxLength={1000}
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={messageSending || !messageText.trim()}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {messageSending ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </section>
          )}
        </aside>
      </div>

      {checkoutOpen && clientSecret && stripePromise && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" onClick={closeCheckout}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">Complete payment</h3>
            <div className="mt-4">
              <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm listingId={listing.id} amount={listing.price} onSuccess={closeCheckout} onCancel={closeCheckout} />
              </Elements>
            </div>
          </div>
        </div>
      )}

      {imageViewerOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[1100] bg-black/95 p-4 sm:p-6" onClick={() => setImageViewerOpen(false)} role="dialog" aria-modal="true" aria-label="Image viewer">
          <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setImageViewerOpen(false)}
              className="absolute right-0 top-0 rounded-full bg-white/10 px-3 py-2 text-2xl leading-none text-white transition hover:bg-white/20"
              aria-label="Close image viewer"
            >
              ×
            </button>

            {hasMultipleImages && (
              <button
                type="button"
                onClick={goPrevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl leading-none text-white transition hover:bg-white/20"
                aria-label="Previous photo"
              >
                ←
              </button>
            )}

            <div className="flex h-full w-full items-center justify-center px-10 py-8">
              <img src={currentImage} alt={listing.title} className="max-h-[88vh] max-w-full object-contain" />
            </div>

            {hasMultipleImages && (
              <button
                type="button"
                onClick={goNextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl leading-none text-white transition hover:bg-white/20"
                aria-label="Next photo"
              >
                →
              </button>
            )}

            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
                {imageViewerIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}

      {cartToast && (
        <div className="fixed bottom-4 right-4 z-[1200] rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {cartToast}
        </div>
      )}
    </div>
  )
}