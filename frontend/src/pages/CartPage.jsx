// import { useEffect, useMemo, useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'

// const CART_STORAGE_KEY = 'shopping_cart_v1'

// function readCart() {
//   try {
//     const raw = localStorage.getItem(CART_STORAGE_KEY)
//     const parsed = raw ? JSON.parse(raw) : []
//     return Array.isArray(parsed) ? parsed : []
//   } catch {
//     return []
//   }
// }

// function writeCart(items) {
//   localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
//   window.dispatchEvent(new Event('storage'))
//   window.dispatchEvent(new CustomEvent('cart:updated'))
// }

// export default function CartPage() {
//   const navigate = useNavigate()
//   const [items, setItems] = useState([])

//   useEffect(() => {
//     const syncCart = () => setItems(readCart())

//     syncCart()
//     window.addEventListener('storage', syncCart)
//     window.addEventListener('cart:updated', syncCart)

//     return () => {
//       window.removeEventListener('storage', syncCart)
//       window.removeEventListener('cart:updated', syncCart)
//     }
//   }, [])

//   const subtotal = useMemo(
//     () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
//     [items]
//   )

//   function updateQuantity(listingId, delta) {
//     const next = readCart().map((item) => {
//       if (item.listingId !== listingId) return item
//       const quantity = Math.max(1, Number(item.quantity || 1) + delta)
//       return { ...item, quantity }
//     })
//     writeCart(next)
//   }

//   function removeItem(listingId) {
//     const next = readCart().filter((item) => item.listingId !== listingId)
//     writeCart(next)
//   }

//   function clearCart() {
//     writeCart([])
//   }

//   function handleCheckout() {
//     navigate('/checkout')
//   }

//   return (
//     <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
//       <div className="mb-6 flex items-center justify-between gap-4">
//         <div>
//           <p className="text-sm text-slate-500">Shopping cart</p>
//           <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Your cart</h1>
//         </div>
//         <Link
//           to="/explore"
//           className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
//         >
//           Continue shopping
//         </Link>
//       </div>

//       {items.length === 0 ? (
//         <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
//           <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
//           <p className="mt-2 text-sm text-slate-500">Add a listing from a product page to start building your cart.</p>
//           <Link
//             to="/explore"
//             className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
//           >
//             Browse listings
//           </Link>
//         </div>
//       ) : (
//         <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
//           <section className="space-y-4">
//             <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//               <div className="flex items-center justify-between gap-3">
//                 <h2 className="text-lg font-semibold text-slate-900">Items</h2>
//                 <button
//                   type="button"
//                   onClick={clearCart}
//                   className="text-sm font-medium text-rose-600 hover:text-rose-700"
//                 >
//                   Clear cart
//                 </button>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {items.map((item) => (
//                 <article key={item.listingId} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
//                   <div className="flex gap-4">
//                     <Link to={`/listings/${item.listingId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
//                       {item.image ? (
//                         <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
//                       ) : (
//                         <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
//                       )}
//                     </Link>

//                     <div className="min-w-0 flex-1">
//                       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                         <div className="min-w-0">
//                           <Link to={`/listings/${item.listingId}`} className="block truncate text-base font-semibold text-slate-900 hover:underline">
//                             {item.title}
//                           </Link>
//                           <p className="mt-1 text-sm text-slate-500">
//                             {item.shippingOption === 'SHIP' ? 'Shipping' : 'Local pickup'}
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-base font-semibold text-slate-900">${Number(item.price || 0).toFixed(2)}</p>
//                           <p className="text-sm text-slate-500">each</p>
//                         </div>
//                       </div>

//                       <div className="mt-4 flex flex-wrap items-center gap-3">
//                         <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
//                           <button
//                             type="button"
//                             onClick={() => updateQuantity(item.listingId, -1)}
//                             className="rounded-full px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-white"
//                             aria-label="Decrease quantity"
//                           >
//                             −
//                           </button>
//                           <span className="min-w-10 px-3 text-center text-sm font-semibold text-slate-900">
//                             {item.quantity || 1}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={() => updateQuantity(item.listingId, 1)}
//                             className="rounded-full px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-white"
//                             aria-label="Increase quantity"
//                           >
//                             +
//                           </button>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => removeItem(item.listingId)}
//                           className="text-sm font-medium text-slate-500 hover:text-rose-600"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </section>

//           <aside className="lg:sticky lg:top-4 h-fit space-y-4">
//             <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//               <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
//               <div className="mt-4 space-y-3 text-sm text-slate-600">
//                 <div className="flex items-center justify-between">
//                   <span>Items</span>
//                   <span>{items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)}</span>
//                 </div>
//                 <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
//                   <span>Subtotal</span>
//                   <span>${subtotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleCheckout}
//                 className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
//               >
//                 Proceed to checkout
//               </button>

//               <p className="mt-3 text-xs leading-5 text-slate-500">
//                 Checkout can stay wired to your existing page while Stripe is in test mode.
//               </p>
//             </section>

//             <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
//               <p className="text-sm font-semibold text-slate-900">Notes</p>
//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 This cart is local for now. It will work before the backend cart exists, which is useful for testing the page layout and checkout flow.
//               </p>
//             </section>
//           </aside>
//         </div>
//       )}
//     </div>
//   )
// }
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  clearCart,
  fetchCart,
  mergeGuestCartIntoServer,
  removeCartItem,
  readGuestCart,
  setCartQuantity,
  writeGuestCart,
} from '../api/cart'

export default function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const syncCart = () => {
      if (!user) {
        setItems(readGuestCart())
      }
    }

    syncCart()
    window.addEventListener('storage', syncCart)
    window.addEventListener('cart:updated', syncCart)

    return () => {
      window.removeEventListener('storage', syncCart)
      window.removeEventListener('cart:updated', syncCart)
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function loadCart() {
      setLoading(true)
      try {
        if (!user) {
          const guest = readGuestCart()
          if (!cancelled) setItems(guest)
          return
        }

        await mergeGuestCartIntoServer(user)
        const data = await fetchCart(user)
        if (!cancelled) setItems(data.items || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCart()
    return () => {
      cancelled = true
    }
  }, [user])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [items]
  )

  async function updateQuantity(listingId, delta) {
    const current = items.find((item) => item.listingId === listingId)
    const nextQuantity = Math.max(1, Number(current?.quantity || 1) + delta)

    const result = await setCartQuantity(user, listingId, nextQuantity)
    setItems(result.items || [])
  }

  async function handleRemove(listingId) {
    const result = await removeCartItem(user, listingId)
    setItems(result.items || [])
  }

  async function handleClearCart() {
    const result = await clearCart(user)
    setItems(result.items || [])
  }

  function handleCheckout() {
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <p className="text-sm text-slate-600">Loading cart…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Shopping cart</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Your cart</h1>
        </div>
        <Link
          to="/explore"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
          <p className="mt-2 text-sm text-slate-500">Add a listing from a product page to start building your cart.</p>
          <Link
            to="/explore"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Items</h2>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  Clear cart
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.listingId} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <Link to={`/listings/${item.listingId}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link to={`/listings/${item.listingId}`} className="block truncate text-base font-semibold text-slate-900 hover:underline">
                            {item.title}
                          </Link>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.shippingOption === 'SHIP' ? 'Shipping' : 'Local pickup'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-semibold text-slate-900">${Number(item.price || 0).toFixed(2)}</p>
                          <p className="text-sm text-slate-500">each</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, -1)}
                            className="rounded-full px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-white"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-10 px-3 text-center text-sm font-semibold text-slate-900">
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.listingId, 1)}
                            className="rounded-full px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-white"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.listingId)}
                          className="text-sm font-medium text-slate-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="lg:sticky lg:top-4 h-fit space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Proceed to checkout
              </button>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Signed-in carts are now server-backed. Guest carts stay in localStorage.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  )
}