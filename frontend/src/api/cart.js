import { api } from './client'

const CART_STORAGE_KEY = 'shopping_cart_v1'

export function readGuestCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeGuestCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new CustomEvent('cart:updated'))
}

export function clearGuestCart() {
  writeGuestCart([])
}

export async function fetchCart(user) {
  if (!user) {
    const items = readGuestCart()
    return { items, itemCount: items.reduce((sum, item) => sum + Number(item.quantity || 1), 0) }
  }

  return api('/api/cart')
}

export async function addCartItem(user, item) {
  if (!user) {
    const cart = readGuestCart()
    const existing = cart.find((x) => x.listingId === item.listingId)

    if (existing) {
      existing.quantity = Number(existing.quantity || 1) + Number(item.quantity || 1)
      writeGuestCart(cart)
      return { items: cart }
    }

    const next = [...cart, { ...item, quantity: Number(item.quantity || 1) }]
    writeGuestCart(next)
    return { items: next }
  }

  return api('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export async function setCartQuantity(user, listingId, quantity) {
  if (!user) {
    const next = readGuestCart()
      .map((item) => (item.listingId === listingId ? { ...item, quantity } : item))
      .filter((item) => Number(item.quantity || 1) > 0)

    writeGuestCart(next)
    return { items: next }
  }

  return api(`/api/cart/items/${listingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })
}

export async function removeCartItem(user, listingId) {
  if (!user) {
    const next = readGuestCart().filter((item) => item.listingId !== listingId)
    writeGuestCart(next)
    return { items: next }
  }

  return api(`/api/cart/items/${listingId}`, {
    method: 'DELETE',
  })
}

export async function clearCart(user) {
  if (!user) {
    clearGuestCart()
    return { items: [] }
  }

  return api('/api/cart', {
    method: 'DELETE',
  })
}

export async function mergeGuestCartIntoServer(user) {
  if (!user) return null

  const guestItems = readGuestCart()
  if (!guestItems.length) return null

  const result = await api('/api/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ items: guestItems }),
  })

  clearGuestCart()
  return result
}