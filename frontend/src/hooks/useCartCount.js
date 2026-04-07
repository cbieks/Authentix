import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchCart, readGuestCart } from '../api/cart'

export function useCartCount() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        if (user) {
          const data = await fetchCart(user)
          const items = data.items || []
          const next = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
          if (alive) setCount(next)
        } else {
          const items = readGuestCart()
          const next = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
          if (alive) setCount(next)
        }
      } catch {
        if (alive) setCount(0)
      }
    }

    load()

    const refresh = () => load()
    window.addEventListener('storage', refresh)
    window.addEventListener('cart:updated', refresh)

    return () => {
      alive = false
      window.removeEventListener('storage', refresh)
      window.removeEventListener('cart:updated', refresh)
    }
  }, [user])

  return count
}