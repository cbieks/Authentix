
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

const HERO_ROTATE_MS = 5000

function getTitle(item) {
  return item?.title || item?.name || 'Untitled'
}

function getImage(item) {
  return item?.images?.[0] || item?.imageUrl || item?.image || ''
}

function getPrice(item) {
  const p = item?.price ?? item?.currentPrice ?? item?.salePrice
  if (p === undefined || p === null || p === '') return '—'
  const n = Number(p)
  return Number.isFinite(n)
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(n)
    : '—'
}

function getLink(item) {
  if (!item) return '/explore'
  if (item.id) return `/listings/${item.id}`
  if (item.slug) return `/listings/${item.slug}`
  return '/explore'
}

export default function HeroCarousel({
  title = 'Your next collectible awaits',
  subtitle = 'Find what you have been hunting for.',
  products = [],
  loading = false,
}) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [itemsPerSlide, setItemsPerSlide] = useState(3)
  const intervalRef = useRef(null)

  useEffect(() => {
    function updateLayout() {
      setItemsPerSlide(window.innerWidth < 640 ? 1 : 3)
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  const slides = useMemo(() => {
    const list = Array.isArray(products) ? products.slice(0, 12) : []
    const chunks = []

    for (let i = 0; i < list.length; i += itemsPerSlide) {
      chunks.push(list.slice(i, i + itemsPerSlide))
    }

    return chunks.length ? chunks : [[]]
  }, [products, itemsPerSlide])

  const total = slides.length

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (!isPaused && total > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((current) => (current + 1) % total)
      }, HERO_ROTATE_MS)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, total])

  function prev() {
    setIndex((current) => (current - 1 + total) % total)
  }

  function next() {
    setIndex((current) => (current + 1) % total)
  }

  return (
    <section className="my-4 overflow-hidden rounded-3xl bg-sky-500 text-slate-950 shadow-lg shadow-slate-900/10">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-900/75 sm:text-base">
                {subtitle}
              </p>
            </div>

            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Shop now
            </Link>
          </div>

          <div
            className="overflow-hidden rounded-2xl bg-white/15 p-3 backdrop-blur-sm"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[170px] rounded-2xl bg-white/70 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="relative">
                  {slides.map((slide, slideIndex) => (
                    <div
                      key={slideIndex}
                      className={slideIndex === index ? 'block' : 'hidden'}
                      aria-hidden={slideIndex !== index}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {slide.map((item) => {
                          const image = getImage(item)
                          const titleText = getTitle(item)

                          return (
                            <Link
                              key={item.id}
                              to={getLink(item)}
                              className="group flex min-h-[170px] flex-col justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={titleText}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold uppercase text-slate-500">
                                      {titleText.slice(0, 2)}
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate text-sm font-semibold text-slate-950">
                                    {titleText}
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-600">
                                    {getPrice(item)}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 text-xs font-semibold text-sky-700 transition group-hover:text-sky-900">
                                View item →
                              </div>
                            </Link>
                          )
                        })}
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
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950 shadow-sm ring-1 ring-slate-900/10 transition hover:bg-slate-50"
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
                            className={
                              i === index
                                ? 'h-2.5 w-8 rounded-full bg-slate-950'
                                : 'h-2.5 w-2.5 rounded-full bg-white/75 transition hover:bg-white'
                            }
                            aria-label={`Go to slide ${i + 1}`}
                            aria-pressed={i === index}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={next}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-950 shadow-sm ring-1 ring-slate-900/10 transition hover:bg-slate-50"
                        aria-label="Next slide"
                      >
                        ›
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPaused((current) => !current)}
                      className="inline-flex items-center justify-center rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-slate-900/10 transition hover:bg-slate-50"
                      aria-pressed={isPaused}
                    >
                      {isPaused ? 'Play' : 'Pause'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}