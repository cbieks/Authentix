import { useRef } from 'react'
import { Link } from 'react-router-dom'
import './CategoryScroller.css'

export default function CategoryScroller({ categories = [], loading }) {
  const scrollRef = useRef(null)

  function scroll(direction) {
    if (!scrollRef.current) return
    const amount = 200
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="category-scroller">
        <div className="category-scroller-inner loading">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="category-bubble skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (!categories.length) return null

  return (
    <div className="category-scroller">
      <button
        type="button"
        className="category-scroller-arrow left"
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
      >
        ‹
      </button>
      <div className="category-scroller-fade left" aria-hidden />
      <div className="category-scroller-inner" ref={scrollRef}>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/explore?categoryId=${c.id}`}
            className="category-bubble"
          >
            {c.name}
          </Link>
        ))}
      </div>
      <div className="category-scroller-fade right" aria-hidden />
      <button
        type="button"
        className="category-scroller-arrow right"
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
      >
        ›
      </button>
    </div>
  )
}
