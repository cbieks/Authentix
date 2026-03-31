import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function CategoryScroller({ categories = [], loading }) {
  const scrollRef = useRef(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    function update() {
      setCompact(window.innerWidth < 1000)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function scroll(direction) {
    if (!scrollRef.current) return
    const amount = 220
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <div className="mb-6 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="h-10 min-w-[92px] rounded-full border border-white/10 bg-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!categories.length) return null

  return (
    <section className="mb-6 px-4">
      <div className="mx-auto max-w-7xl">
        {compact ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll categories left"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-950/90 text-xl text-slate-100 shadow-sm transition hover:bg-white/10 hover:text-white"
            >
              ‹
            </button>

            <div
              ref={scrollRef}
              className="flex-1 gap-3 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-3">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/explore?categoryId=${c.id}`}
                    className="shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm whitespace-nowrap text-slate-200 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:text-white"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll categories right"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-950/90 text-xl text-slate-100 shadow-sm transition hover:bg-white/10 hover:text-white"
            >
              ›
            </button>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/explore?categoryId=${c.id}`}
                className="shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm whitespace-nowrap text-slate-200 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}