import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import CategoryScroller from '../components/CategoryScroller'
import ProductCarousel from '../components/ProductCarousel'
import './Home.css'

const MAX_CAROUSEL = 10

export default function Home() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [recommended, setRecommended] = useState([])
  const [recommendedLoading, setRecommendedLoading] = useState(true)
  const [nearYou, setNearYou] = useState([])
  const [nearYouLoading, setNearYouLoading] = useState(true)
  const [lowestPrice, setLowestPrice] = useState([])
  const [lowestPriceLoading, setLowestPriceLoading] = useState(true)

  const userZip = user?.zipCode ?? null

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
    if (userZip) {
      api(`/api/listings?page=0&size=${MAX_CAROUSEL}`)
        .then((res) => {
          const list = res?.content ?? []
          setNearYou(list.slice(0, MAX_CAROUSEL))
        })
        .catch(() => setNearYou([]))
        .finally(() => setNearYouLoading(false))
    } else {
      api(`/api/listings?page=0&size=${MAX_CAROUSEL}`)
        .then((res) => {
          const list = res?.content ?? []
          setNearYou(list.slice(0, MAX_CAROUSEL))
        })
        .catch(() => setNearYou([]))
        .finally(() => setNearYouLoading(false))
    }
  }, [userZip])

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
          emptyMessage="No listings nearby. Add your zip in Account to see local results."
        />
        {!userZip && user && (
          <p className="home-zip-prompt"><Link to="/account">Add zip code to personalize</Link></p>
        )}
        {!userZip && !user && (
          <p className="home-zip-hint">Sign in to add your zip for local listings.</p>
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
