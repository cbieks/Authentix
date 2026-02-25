import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './ProductCarousel.css'

/**
 * @param {Object} listing - { id, title, price, images, ... }
 * @returns {string} Display price (current = single price field)
 */
function getCurrentPrice(listing) {
  if (listing == null) return '—'
  const p = listing.price
  if (p === undefined || p === null) return '—'
  if (typeof p === 'number') return `$${Number(p).toFixed(2)}`
  if (typeof p === 'object' && typeof p.toFixed === 'function') return `$${Number(p).toFixed(2)}`
  return '—'
}

export default function ProductCarousel({ title, products = [], loading, emptyMessage = 'No listings yet.' }) {
  const scrollRef = useRef(null)

  function scroll(direction) {
    if (!scrollRef.current) return
    const cardWidth = 160
    const gap = 12
    const amount = (cardWidth + gap) * 4
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const list = Array.isArray(products) ? products.slice(0, 10) : []

  return (
    <section className="product-carousel">
      <div className="product-carousel-header">
        <h2 className="product-carousel-title">{title}</h2>
        {list.length > 0 && (
          <>
            <button
              type="button"
              className="product-carousel-arrow left"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              type="button"
              className="product-carousel-arrow right"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              ›
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="product-carousel-inner loading" ref={scrollRef}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="product-card skeleton" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="product-carousel-empty">{emptyMessage}</p>
      ) : (
        <div className="product-carousel-inner" ref={scrollRef}>
          {list.map((item) => (
            <Link key={item.id} to={`/listings/${item.id}`} className="product-card">
              <div className="product-card-image-wrap">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt="" />
                ) : (
                  <span className="product-card-no-image">No image</span>
                )}
              </div>
              <h3 className="product-card-title">{item.title || 'Untitled'}</h3>
              <p className="product-card-price">{getCurrentPrice(item)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
