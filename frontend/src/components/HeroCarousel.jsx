import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './HeroCarousel.css' // create this file (see CSS below)

const TILES_PER_SLIDE = 6
const HERO_ROTATE_MS = 5000

export default function HeroCarousel({ categories = [], title = "Your next collectible awaits", subtitle = "Find what you've been hunting for." }) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const total = Math.max(1, Math.ceil(categories.length / TILES_PER_SLIDE))
  const intervalRef = useRef(null)

  // chunk categories into slides
  const chunks = []
  for (let i = 0; i < categories.length; i += TILES_PER_SLIDE) {
    chunks.push(categories.slice(i, i + TILES_PER_SLIDE))
  }
  if (chunks.length === 0) chunks.push([])

  // auto-rotate effect (respects pause)
  useEffect(() => {
    // clear any previous
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % total)
      }, HERO_ROTATE_MS)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPaused, total])

  // navigation helpers
  function prev() {
    setIndex((i) => (i - 1 + total) % total)
  }
  function next() {
    setIndex((i) => (i + 1) % total)
  }
  function goTo(i) {
    setIndex(i % total)
  }
  function togglePause() {
    setIsPaused((p) => !p)
  }

  // keyboard left/right/p to pause
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'p' || e.key === ' ') togglePause()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  return (
    <section className="hero-carousel" aria-roledescription="carousel">
      <div className="hero-inner">
        <div className="hero-copy" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <Link to="/explore" className="hero-cta">Shop now</Link>
        </div>

        <div className="hero-slider-wrapper">
          <div className="hero-slider">
            {chunks.map((chunk, i) => (
              <div key={i} className={`hero-slide ${i === index ? 'active' : ''}`} aria-hidden={i !== index}>
                <div className="hero-categories-grid">
                  {chunk.map((cat, ci) => (
                    <Link
                      key={cat?.id ?? `${i}-${ci}`}
                      to={`/explore?category=${encodeURIComponent(cat?.slug ?? cat?.name ?? '')}`}
                      className="hero-category-tile"
                    >
                      {cat?.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name || 'category'} />
                      ) : (
                        <div className="hero-category-fallback">{(cat?.name || 'Category').slice(0,2).toUpperCase()}</div>
                      )}
                      <div className="hero-category-name">{cat?.name || 'Category'}</div>
                    </Link>
                  ))}
                  {Array.from({ length: Math.max(0, TILES_PER_SLIDE - chunk.length) }).map((_, k) => (
                    <div className="hero-category-tile hero-empty" key={`empty-${k}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="hero-controls">
            <button className="hero-btn" onClick={prev} aria-label="Previous slide">‹</button>

            <div className="hero-dots" role="tablist" aria-label="Slides">
              {chunks.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === index ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-pressed={i === index}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button className="hero-btn" onClick={next} aria-label="Next slide">›</button>

            <button
              className="hero-pause"
              onClick={togglePause}
              aria-pressed={isPaused}
              title={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}