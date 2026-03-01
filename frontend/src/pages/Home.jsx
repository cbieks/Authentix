import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDiscoveryZip } from '../context/DiscoveryZipContext'
import { api } from '../api/client'
import CategoryScroller from '../components/CategoryScroller'
import ProductCarousel from '../components/ProductCarousel'
import './Home.css'

const MAX_CAROUSEL = 10

export default function Home() {
  const { user, refetchUser } = useAuth()
  const { guestZip, setGuestZip } = useDiscoveryZip()
  const [categories, setCategories] = useState([])
  const [zipInput, setZipInput] = useState('')
  const [zipCountry, setZipCountry] = useState('US')
  const [zipSaving, setZipSaving] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [recommended, setRecommended] = useState([])
  const [recommendedLoading, setRecommendedLoading] = useState(true)
  const [nearYou, setNearYou] = useState([])
  const [nearYouLoading, setNearYouLoading] = useState(true)
  const [lowestPrice, setLowestPrice] = useState([])
  const [lowestPriceLoading, setLowestPriceLoading] = useState(true)

  const zipForNearYou = user
    ? (user.discoveryZipCode?.trim() || null)
    : (guestZip?.trim() || null)

  useEffect(() => {
    if (!zipForNearYou?.trim()) {
      setZipInput('')
    }
  }, [zipForNearYou])

  async function handleZipSave() {
    const zip = zipInput?.trim() || ''
    if (!zip) return
    setZipSaving(true)
    try {
      if (user) {
        await api('/api/users/me/discovery-location', {
          method: 'PUT',
          body: JSON.stringify({
            zipCode: zip,
            country: (zipCountry || 'US').toUpperCase().slice(0, 2),
          }),
        })
        await refetchUser()
      } else {
        setGuestZip(zip)
      }
    } catch (_) {}
    setZipSaving(false)
  }

  useEffect(() => {
    api('/api/categories')
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    api('/api/listings/recommended')
      .then((data) => setRecommended(Array.isArray(data) ? data.slice(0, MAX_CAROUSEL) : []))
      .catch(() => setRecommended([]))
      .finally(() => setRecommendedLoading(false))
  }, [])

  useEffect(() => {
    setNearYouLoading(true)
    const zip = zipForNearYou?.trim() || null
    const url = zip
      ? `/api/listings/nearby?zip=${encodeURIComponent(zip)}&limit=${MAX_CAROUSEL}`
      : `/api/listings/nearby?limit=${MAX_CAROUSEL}`
    api(url)
      .then((data) => setNearYou(Array.isArray(data) ? data.slice(0, MAX_CAROUSEL) : []))
      .catch(() => setNearYou([]))
      .finally(() => setNearYouLoading(false))
  }, [zipForNearYou])

  useEffect(() => {
    setLowestPriceLoading(true)
    api(`/api/listings?page=0&size=50`)
      .then((res) => {
        const list = res?.content ?? []
        const sorted = [...list].sort((a, b) => {
          const pa = a.price != null ? Number(a.price) : Infinity
          const pb = b.price != null ? Number(b.price) : Infinity
          return pa - pb
        })
        setLowestPrice(sorted.slice(0, MAX_CAROUSEL))
      })
      .catch(() => setLowestPrice([]))
      .finally(() => setLowestPriceLoading(false))
  }, [])

  return (
    <div className="home-page">
      <section className="home-categories">
        <CategoryScroller categories={categories} loading={categoriesLoading} />
      </section>

      <section className="home-section">
        <ProductCarousel
          title="Recommended for you"
          products={recommended}
          loading={recommendedLoading}
          emptyMessage="No recommendations yet. Browse and save items to personalize."
        />
      </section>

      <section className="home-section">
        <ProductCarousel
          title="Near you"
          products={nearYou}
          loading={nearYouLoading}
          emptyMessage={zipForNearYou ? 'No listings in this area yet.' : 'Enter your ZIP below to see listings near you.'}
        />
        {!zipForNearYou && (
          <div className="home-near-you-cta"><div className="home-zip-entry"><input
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                placeholder="Enter ZIP / postal code"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleZipSave())}
              />{user && (<input
                type="text"
                value={zipCountry}
                onChange={(e) => setZipCountry(e.target.value)}
                placeholder="US"
                maxLength={2}
                className="home-zip-country"
              />)}<button type="button" onClick={handleZipSave} disabled={zipSaving || !zipInput.trim()}>{zipSaving ? 'Saving…' : 'See listings near you'}</button></div>{!user && <p className="home-zip-hint">Sign in to save your ZIP for future visits.</p>}</div>
        )}
      </section>

      <section className="home-section">
        <ProductCarousel
          title="Lowest prices"
          products={lowestPrice}
          loading={lowestPriceLoading}
          emptyMessage="No listings yet."
        />
      </section>

      <footer className="home-footer">
        <p>
          <Link to="/explore">Browse all</Link>
          {user && (
            <> · <Link to="/listings/new">Sell an item</Link></>
          )}
        </p>
      </footer>
    </div>
  )
}
