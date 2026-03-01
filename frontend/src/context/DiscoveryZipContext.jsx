import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'authentix_guest_zip'

const DiscoveryZipContext = createContext(null)

export function DiscoveryZipProvider({ children }) {
  const [guestZip, setGuestZipState] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && typeof stored === 'string' && stored.trim()) {
        setGuestZipState(stored.trim())
      }
    } catch (_) {}
  }, [])

  const setGuestZip = (value) => {
    const next = value != null && typeof value === 'string' ? value.trim() : ''
    setGuestZipState(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next)
      else localStorage.removeItem(STORAGE_KEY)
    } catch (_) {}
  }

  return (
    <DiscoveryZipContext.Provider value={{ guestZip, setGuestZip }}>
      {children}
    </DiscoveryZipContext.Provider>
  )
}

export function useDiscoveryZip() {
  const ctx = useContext(DiscoveryZipContext)
  if (!ctx) throw new Error('useDiscoveryZip must be used within DiscoveryZipProvider')
  return ctx
}
