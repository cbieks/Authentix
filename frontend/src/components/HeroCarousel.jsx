// import React, { useState, useEffect, useRef } from 'react'
// import { Link } from 'react-router-dom'
// import './HeroCarousel.css' // create this file (see CSS below)

// const TILES_PER_SLIDE = 6
// const HERO_ROTATE_MS = 5000

// export default function HeroCarousel({ categories = [], title = "Your next collectible awaits", subtitle = "Find what you've been hunting for." }) {
//   const [index, setIndex] = useState(0)
//   const [isPaused, setIsPaused] = useState(false)
//   const total = Math.max(1, Math.ceil(categories.length / TILES_PER_SLIDE))
//   const intervalRef = useRef(null)

//   // chunk categories into slides
//   const chunks = []
//   for (let i = 0; i < categories.length; i += TILES_PER_SLIDE) {
//     chunks.push(categories.slice(i, i + TILES_PER_SLIDE))
//   }
//   if (chunks.length === 0) chunks.push([])

//   // auto-rotate effect (respects pause)
//   useEffect(() => {
//     // clear any previous
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current)
//       intervalRef.current = null
//     }

//     if (!isPaused) {
//       intervalRef.current = setInterval(() => {
//         setIndex((i) => (i + 1) % total)
//       }, HERO_ROTATE_MS)
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current)
//         intervalRef.current = null
//       }
//     }
//   }, [isPaused, total])

//   // navigation helpers
//   function prev() {
//     setIndex((i) => (i - 1 + total) % total)
//   }
//   function next() {
//     setIndex((i) => (i + 1) % total)
//   }
//   function goTo(i) {
//     setIndex(i % total)
//   }
//   function togglePause() {
//     setIsPaused((p) => !p)
//   }

//   // keyboard left/right/p to pause
//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === 'ArrowLeft') prev()
//       if (e.key === 'ArrowRight') next()
//       if (e.key === 'p' || e.key === ' ') togglePause()
//     }
//     window.addEventListener('keydown', onKey)
//     return () => window.removeEventListener('keydown', onKey)
//   }, [total])

//   return (
//     <section className="hero-carousel" aria-roledescription="carousel">
//       <div className="hero-inner">
//         <div className="hero-copy" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
//           <h1>{title}</h1>
//           <p>{subtitle}</p>
//           <Link to="/explore" className="hero-cta">Shop now</Link>
//         </div>

//         <div className="hero-slider-wrapper">
//           <div className="hero-slider">
//             {chunks.map((chunk, i) => (
//               <div key={i} className={`hero-slide ${i === index ? 'active' : ''}`} aria-hidden={i !== index}>
//                 <div className="hero-categories-grid">
//                   {chunk.map((cat, ci) => (
//                     <Link
//                       key={cat?.id ?? `${i}-${ci}`}
//                       to={`/explore?category=${encodeURIComponent(cat?.slug ?? cat?.name ?? '')}`}
//                       className="hero-category-tile"
//                     >
//                       {cat?.imageUrl ? (
//                         <img src={cat.imageUrl} alt={cat.name || 'category'} />
//                       ) : (
//                         <div className="hero-category-fallback">{(cat?.name || 'Category').slice(0,2).toUpperCase()}</div>
//                       )}
//                       <div className="hero-category-name">{cat?.name || 'Category'}</div>
//                     </Link>
//                   ))}
//                   {Array.from({ length: Math.max(0, TILES_PER_SLIDE - chunk.length) }).map((_, k) => (
//                     <div className="hero-category-tile hero-empty" key={`empty-${k}`} />
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="hero-controls">
//             <button className="hero-btn" onClick={prev} aria-label="Previous slide">‹</button>

//             <div className="hero-dots" role="tablist" aria-label="Slides">
//               {chunks.map((_, i) => (
//                 <button
//                   key={i}
//                   className={`hero-dot ${i === index ? 'active' : ''}`}
//                   onClick={() => goTo(i)}
//                   aria-pressed={i === index}
//                   aria-label={`Go to slide ${i + 1}`}
//                 />
//               ))}
//             </div>

//             <button className="hero-btn" onClick={next} aria-label="Next slide">›</button>

//             <button
//               className="hero-pause"
//               onClick={togglePause}
//               aria-pressed={isPaused}
//               title={isPaused ? 'Play' : 'Pause'}
//             >
//               {isPaused ? '▶' : '⏸'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }


// function pickFeaturedItemFromCategory(category) {
//   const products = category?.products || category?.items || []

//   if (!Array.isArray(products) || products.length === 0) return null

//   const hasViewsField = products.some(
//     (p) => p && p.views !== undefined && p.views !== null && p.views !== ''
//   )

//   const scoreProduct = (product) => {
//     if (hasViewsField) {
//       return toNumber(product?.views)
//     }

//     return toNumber(
//       product?.price ??
//         product?.currentPrice ??
//         product?.salePrice ??
//         product?.amount ??
//         0
//     )
//   }

//   return [...products].sort((a, b) => scoreProduct(b) - scoreProduct(a))[0] || null
// }

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ITEMS_PER_SLIDE = 6
const ROTATE_MS = 5000

function getPrice(item) {
  if (!item) return '—'
  const p = item.price ?? item.currentPrice ?? item.salePrice
  if (p === undefined || p === null || p === '') return '—'
  const n = Number(p)
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : '—'
}

function getImage(item) {
  return item?.images?.[0] || item?.imageUrl || item?.image || ''
}

function getTitle(item) {
  return item?.title || item?.name || 'Untitled'
}

function getLink(item) {
  if (!item) return '/explore'
  if (item.id) return `/listings/${item.id}`
  if (item.slug) return `/listings/${item.slug}`
  return '/explore'
}

function pickRandom(array) {
  if (!Array.isArray(array) || array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

function normalizeItems({ products = [], categories = [] }) {
  if (Array.isArray(products) && products.length > 0) {
    return products
  }

  if (Array.isArray(categories) && categories.length > 0) {
    return categories
      .map((cat) => {
        const list = cat?.products || cat?.items || cat?.listings || []
        return pickRandom(list)
      })
      .filter(Boolean)
  }

  return []
}

export default function HeroCarousel({
  title = 'Your next collectible awaits',
  subtitle = 'Find what you have been hunting for.',
  products = [],
  categories = [],
  loading = false,
}) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const intervalRef = useRef(null)

  const featuredItems = useMemo(() => {
    const list = normalizeItems({ products, categories })

    if (list.length === 0) return []

    if (Array.isArray(products) && products.length > 0) {
      const shuffled = [...products].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 12)
    }

    return list
  }, [products, categories])

  const slides = useMemo(() => {
    const chunks = []
    for (let i = 0; i < featuredItems.length; i += ITEMS_PER_SLIDE) {
      chunks.push(featuredItems.slice(i, i + ITEMS_PER_SLIDE))
    }
    return chunks.length > 0 ? chunks : [[]]
  }, [featuredItems])

  const total = slides.length

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (!isPaused && isOpen && total > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((current) => (current + 1) % total)
      }, ROTATE_MS)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, isOpen, total])

  function prev() {
    setIndex((current) => (current - 1 + total) % total)
  }

  function next() {
    setIndex((current) => (current + 1) % total)
  }

  return (
    <section className="my-4 overflow-hidden rounded-2xl bg-sky-500 text-slate-950 shadow-lg shadow-slate-900/10">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-900/75 sm:text-base">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Shop now
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="inline-flex items-center justify-center rounded-full border border-slate-950/15 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
              >
                {isOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          <div className={`${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[160px] rounded-2xl bg-white/70 animate-pulse" />
                ))}
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-700">
                No items available.
              </div>
            ) : (
              <div
                className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="relative">
                  {slides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className={slideIndex === index ? 'block' : 'hidden'}
                      aria-hidden={slideIndex !== index}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {slide.map((item) => (
                          <Link
                            key={item.id}
                            to={getLink(item)}
                            className="group flex min-h-[160px] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                {getImage(item) ? (
                                  <img
                                    src={getImage(item)}
                                    alt={getTitle(item)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold uppercase text-slate-500">
                                    {getTitle(item).slice(0, 2)}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 text-sm font-semibold text-slate-950">
                                  {getTitle(item)}
                                </h3>
                                <p className="mt-1 text-xs text-slate-600">{getPrice(item)}</p>
                              </div>
                            </div>

                            <div className="mt-3 text-xs font-semibold text-sky-700 transition group-hover:text-sky-900">
                              View item →
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {total > 1 && (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={prev}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950 shadow-sm ring-1 ring-slate-900/10"
                        aria-label="Previous slide"
                      >
                        ‹
                      </button>

                      <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            className={i === index ? 'h-2.5 w-8 rounded-full bg-slate-950' : 'h-2.5 w-2.5 rounded-full bg-white/75'}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={next}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950 shadow-sm ring-1 ring-slate-900/10"
                        aria-label="Next slide"
                      >
                        ›
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPaused((current) => !current)}
                      className="inline-flex items-center justify-center rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-slate-900/10"
                    >
                      {isPaused ? 'Play' : 'Pause'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}