// import { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import { api } from '../api/client'
// import './MyWatchlist.css'

// export default function MyWatchlist() {
//   const [listings, setListings] = useState([])
//   const [loading, setLoading] = useState(true)

//   const load = () => {
//     api('/api/users/me/watchlist')
//       .then(setListings)
//       .catch(() => setListings([]))
//       .finally(() => setLoading(false))
//   }

//   useEffect(() => { load() }, [])

//   async function remove(e, id) {
//     e.preventDefault()
//     e.stopPropagation()
//     try {
//       await api(`/api/listings/${id}/watchlist`, { method: 'DELETE' })
//       setListings((prev) => prev.filter((l) => l.id !== id))
//     } catch (err) {
//       console.error('Failed to remove from watchlist', err)
//     }
//   }

//   if (loading) return <div className="layout-main"><p>Loading…</p></div>
//   return (
//     <div className="watchlist-page">
//       <h1>My watchlist</h1>
//       {listings.length === 0 ? (
//         <p className="watchlist-empty">Nothing saved yet. Browse <Link to="/explore">Explore</Link> and click Save on listings you like.</p>
//       ) : (
//         <div className="listing-grid">
//           {listings.map((listing) => (
//             <div key={listing.id} className="listing-card watchlist-card">
//               <Link to={`/listings/${listing.id}`} className="listing-card-link">
//                 <div className="listing-card-image">
//                   {listing.images?.[0] ? (
//                     <img src={listing.images[0]} alt="" />
//                   ) : (
//                     <span className="listing-card-placeholder">No image</span>
//                   )}
//                 </div>
//                 <div className="listing-card-body">
//                   <span className="listing-card-price">${Number(listing.price).toFixed(2)}</span>
//                   <h3 className="listing-card-title">{listing.title}</h3>
//                   <p className="listing-card-meta">{listing.categoryName}</p>
//                 </div>
//               </Link>
//               <button type="button" className="watchlist-remove" onClick={(e) => remove(e, listing.id)} aria-label="Remove from watchlist">
//                 Remove
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

function money(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '$0.00'
  return `$${n.toFixed(2)}`
}

function sortByPrice(items = []) {
  return [...items].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
}

export default function MyWatchlist() {
  const [folders, setFolders] = useState([])
  const [activeFolderId, setActiveFolderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [savingFolder, setSavingFolder] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await api('/api/users/me/watchlist-folders')
      const nextFolders = Array.isArray(data) ? data : []
      setFolders(nextFolders)
      setActiveFolderId((prev) => prev ?? nextFolders[0]?.id ?? null)
    } catch (err) {
      console.error('Failed to load watchlist folders', err)
      setFolders([])
      setActiveFolderId(null)
    } finally {
      setLoading(false)
    }
  }

  const activeFolder = useMemo(() => {
    return folders.find((folder) => folder.id === activeFolderId) || folders[0] || null
  }, [folders, activeFolderId])

  const activeItems = useMemo(() => {
    return sortByPrice(activeFolder?.items || [])
  }, [activeFolder])

  const cheapestItem = activeItems[0] || null

  async function createFolder(e) {
    e.preventDefault()
    const name = newFolderName.trim()
    if (!name) return

    setSavingFolder(true)
    try {
      const created = await api('/api/users/me/watchlist-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      setFolders((prev) => [created, ...prev])
      setActiveFolderId(created.id)
      setNewFolderName('')
    } catch (err) {
      console.error('Failed to create folder', err)
    } finally {
      setSavingFolder(false)
    }
  }

  async function removeFromFolder(e, listingId) {
    e.preventDefault()
    e.stopPropagation()

    if (!activeFolder) return

    try {
      await api(`/api/users/me/watchlist-folders/${activeFolder.id}/items/${listingId}`, {
        method: 'DELETE',
      })

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === activeFolder.id
            ? { ...folder, items: (folder.items || []).filter((item) => item.id !== listingId) }
            : folder
        )
      )
    } catch (err) {
      console.error('Failed to remove item from folder', err)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading watchlist…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My watchlist</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize saved items into named folders and compare prices inside each one.
          </p>
        </div>

        <form onSubmit={createFolder} className="flex w-full gap-2 sm:w-auto">
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-slate-900 sm:w-64"
          />
          <button
            type="submit"
            disabled={savingFolder}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingFolder ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>

      {folders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">
            No folders yet. Create one for watches, sneakers, laptops, or anything else you want to track.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Saved listings from <Link to="/explore" className="font-medium text-slate-900 underline">Explore</Link> can be added into a folder.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Folders</h2>
            </div>

            <div className="space-y-2">
              {folders.map((folder) => {
                const sorted = sortByPrice(folder.items || [])
                const lowest = sorted[0]
                const isActive = folder.id === (activeFolder?.id || activeFolderId)

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolderId(folder.id)}
                    className={[
                      'w-full rounded-2xl border p-4 text-left transition',
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{folder.name}</div>
                        <div className={isActive ? 'text-xs text-slate-300' : 'text-xs text-slate-500'}>
                          {sorted.length} item{sorted.length === 1 ? '' : 's'}
                        </div>
                      </div>

                      {lowest ? (
                        <div className={isActive ? 'text-right text-xs text-slate-300' : 'text-right text-xs text-slate-500'}>
                          Lowest
                          <div className="font-semibold">{money(lowest.price)}</div>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 flex gap-2">
                      {(folder.items || []).slice(0, 3).map((item) => (
                        <div key={item.id} className="h-12 w-12 overflow-hidden rounded-xl border border-white/20 bg-slate-100">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                      ))}

                      {(folder.items || []).length === 0 ? (
                        <div className={isActive ? 'text-xs text-slate-300' : 'text-xs text-slate-500'}>
                          Empty folder
                        </div>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <main className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            {activeFolder ? (
              <>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{activeFolder.name}</h2>
                    <p className="text-sm text-slate-500">
                      {activeItems.length} saved item{activeItems.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  {cheapestItem ? (
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      Lowest price in this folder: <span className="font-semibold">{money(cheapestItem.price)}</span>
                    </div>
                  ) : null}
                </div>

                {activeItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                    <p className="text-sm text-slate-500">No items in this folder yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {activeItems.map((listing, index) => {
                      const isCheapest = index === 0

                      return (
                        <div key={listing.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <Link to={`/listings/${listing.id}`} className="block">
                            <div className="relative aspect-[4/3] bg-slate-100">
                              {listing.images?.[0] ? (
                                <img
                                  src={listing.images[0]}
                                  alt=""
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                  No image
                                </div>
                              )}

                              {isCheapest ? (
                                <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                  Lowest price
                                </span>
                              ) : null}
                            </div>

                            <div className="space-y-2 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{listing.title}</h3>
                                <span className="shrink-0 text-sm font-semibold text-emerald-700">
                                  {money(listing.price)}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500">{listing.categoryName}</p>
                            </div>
                          </Link>

                          <div className="flex gap-2 border-t border-slate-200 p-3">
                            <button
                              type="button"
                              className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                              onClick={() => console.log('Add to cart later:', listing.id)}
                            >
                              Add to cart
                            </button>

                            <button
                              type="button"
                              onClick={(e) => removeFromFolder(e, listing.id)}
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <p className="text-sm text-slate-500">Select a folder to preview its items.</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}