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
import { useAuth } from '../context/AuthContext'
import { addCartItem } from '../api/cart'

function money(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '$0.00'
  return `$${n.toFixed(2)}`
}

function sortByPrice(items = []) {
  return [...items].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
}

export default function MyWatchlist() {
  const { user } = useAuth()

  const [folders, setFolders] = useState([])
  const [activeFolderId, setActiveFolderId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [savingFolder, setSavingFolder] = useState(false)

  const [cartToast, setCartToast] = useState('')
  const [renamingFolderId, setRenamingFolderId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const [addingItemId, setAddingItemId] = useState(null)
  const [targetFolderByItem, setTargetFolderByItem] = useState({})
  const [deletingFolderId, setDeletingFolderId] = useState(null)

  const [savedListings, setSavedListings] = useState([])

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!cartToast) return
    const timer = window.setTimeout(() => setCartToast(''), 2200)
    return () => window.clearTimeout(timer)
  }, [cartToast])

  async function load() {
    setLoading(true)
    try {
      const [savedData, folderData] = await Promise.all([
        api('/api/users/me/watchlist'),
        api('/api/users/me/watchlist-folders'),
      ])

      setSavedListings(Array.isArray(savedData) ? savedData : [])
      setFolders(Array.isArray(folderData) ? folderData : [])
      setActiveFolderId((prev) => prev ?? folderData?.[0]?.id ?? null)
    } catch (err) {
      console.error('Failed to load watchlist data', err)
      setSavedListings([])
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

  async function handleAddToCart(item) {
    if (!user || !item) return

    const cartItem = {
      listingId: item.listingId ?? item.id,
      title: item.title,
      price: Number(item.price),
      image: item.images?.[0] || null,
      shippingOption: item.shippingOption,
      quantity: 1,
    }

    try {
      await addCartItem(user, cartItem)
      setCartToast('Added to cart')
    } catch (err) {
      console.error('Failed to add to cart', err)
      alert(err?.message || 'Failed to add to cart')
    }
  }

  async function createFolder(e) {
    e.preventDefault()
    const name = newFolderName.trim()
    if (!name) return

    const duplicate = folders.some((folder) => folder.name.trim().toLowerCase() === name.toLowerCase())
    if (duplicate) {
      alert('That folder name already exists.')
      return
    }

    setSavingFolder(true)
    try {
      await api('/api/users/me/watchlist-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      setNewFolderName('')
      setCreateModalOpen(false)
      await load()
    } catch (err) {
      console.error('Failed to create folder', err)
      alert(err?.message || 'Failed to create folder')
    } finally {
      setSavingFolder(false)
    }
  }

  async function renameFolder(folderId) {
    const name = renameValue.trim()
    if (!name) return

    try {
      await api(`/api/users/me/watchlist-folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      setRenamingFolderId(null)
      setRenameValue('')
      await load()
    } catch (err) {
      console.error('Failed to rename folder', err)
      alert(err?.message || 'Failed to rename folder')
    }
  }

  async function deleteFolder(folderId) {
    const folder = folders.find((f) => f.id === folderId)
    const ok = window.confirm(`Delete folder "${folder?.name || 'this folder'}"? This cannot be undone.`)
    if (!ok) return

    setDeletingFolderId(folderId)
    try {
      await api(`/api/users/me/watchlist-folders/${folderId}`, {
        method: 'DELETE',
      })

      setRenamingFolderId((prev) => (prev === folderId ? null : prev))
      setTargetFolderByItem((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (String(next[key]) === String(folderId)) {
            delete next[key]
          }
        }
        return next
      })
      await load()
    } catch (err) {
      console.error('Failed to delete folder', err)
      alert(err?.message || 'Failed to delete folder')
    } finally {
      setDeletingFolderId(null)
    }
  }

  async function addItemToFolder(listingId, folderId) {
    if (!folderId || !listingId) return

    setAddingItemId(listingId)
    try {
      await api(`/api/users/me/watchlist-folders/${folderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })

      setTargetFolderByItem((prev) => ({ ...prev, [listingId]: '' }))
      setCartToast('Added to folder')
      await load()
    } catch (err) {
      console.error('Failed to add item to folder', err)
      alert(err?.message || 'Failed to add item to folder')
    } finally {
      setAddingItemId(null)
    }
  }

  async function removeFromFolder(folderId, listingId) {
    if (!folderId || !listingId) return

    try {
      await api(`/api/users/me/watchlist-folders/${folderId}/items/${listingId}`, {
        method: 'DELETE',
      })
      await load()
    } catch (err) {
      console.error('Failed to remove item from folder', err)
      alert(err?.message || 'Failed to remove item from folder')
    }
  }

  async function removeSaved(listingId) {
    if (!listingId) return

    try {
      await api(`/api/listings/${listingId}/watchlist`, {
        method: 'DELETE',
      })
      await load()
    } catch (err) {
      console.error('Failed to remove from saved watchlist', err)
      alert(err?.message || 'Failed to remove from watchlist')
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

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto"
        >
          Create folder
        </button>
      </div>

      {/* MASTER SAVED SECTION */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Saved</h2>
            <p className="text-sm text-slate-500">
              Removing here unhearts the item and removes it from all folders.
            </p>
          </div>
          <p className="text-sm text-slate-500">{savedListings.length} item{savedListings.length === 1 ? '' : 's'}</p>
        </div>

        {savedListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm text-slate-500">No saved items yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {savedListings.map((listing) => {
              const selectedFolderId = targetFolderByItem[listing.id] || activeFolder?.id || ''
              const alreadyInSelectedFolder = folders.some(
                (folder) =>
                  String(folder.id) === String(selectedFolderId) &&
                  (folder.items || []).some((item) => item.listingId === listing.id),
              )

              return (
                <div
                  key={listing.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
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

                  <div className="space-y-3 border-t border-slate-200 p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        onClick={() => handleAddToCart(listing)}
                      >
                        Add to cart
                      </button>

                      <button
                        type="button"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        onClick={() => removeSaved(listing.id)}
                      >
                        Remove
                      </button>
                    </div>

                    {folders.length > 0 ? (
                      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Add to folder
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={selectedFolderId}
                            onChange={(e) =>
                              setTargetFolderByItem((prev) => ({ ...prev, [listing.id]: e.target.value }))
                            }
                            className="text-slate-700 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                          >
                            {folders.map((folder) => (
                              <option key={folder.id} value={folder.id}>
                                {folder.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={addingItemId === listing.id || alreadyInSelectedFolder}
                            onClick={() => addItemToFolder(listing.id, Number(selectedFolderId))}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {addingItemId === listing.id ? 'Adding…' : alreadyInSelectedFolder ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FOLDER SECTION */}
      {folders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">
            No folders yet. Create one for watches, sneakers, laptops, or anything else you want to track.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Saved listings from{' '}
            <Link to="/explore" className="font-medium text-slate-900 underline">
              Explore
            </Link>{' '}
            can be added into a folder.
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
                  <div
                    key={folder.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveFolderId(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setActiveFolderId(folder.id)
                      }
                    }}
                    className={[
                      'w-full cursor-pointer rounded-2xl border p-4 text-left transition',
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
                        <div
                          className={
                            isActive ? 'text-right text-xs text-slate-300' : 'text-right text-xs text-slate-500'
                          }
                        >
                          Lowest
                          <div className="font-semibold">{money(lowest.price)}</div>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-3 flex gap-2">
                      {(folder.items || []).slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="h-12 w-12 overflow-hidden rounded-xl border border-white/20 bg-slate-100"
                        >
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

                    <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenamingFolderId(folder.id)
                          setRenameValue(folder.name)
                        }}
                      >
                        Rename
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deletingFolderId === folder.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteFolder(folder.id)
                        }}
                      >
                        {deletingFolderId === folder.id ? 'Deleting…' : 'Delete folder'}
                      </button>
                    </div>

                    {renamingFolderId === folder.id ? (
                      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none"
                          placeholder="Folder name"
                        />
                        <button
                          type="button"
                          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            renameFolder(folder.id)
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : null}
                  </div>
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
                    {activeItems.map((item, index) => {
                      const isCheapest = index === 0
                      const selectedFolderId = targetFolderByItem[item.listingId] || activeFolder.id || ''
                      const alreadyInSelectedFolder = folders.some(
                        (folder) =>
                          String(folder.id) === String(selectedFolderId) &&
                          (folder.items || []).some((fItem) => fItem.listingId === item.listingId),
                      )

                      return (
                        <div
                          key={item.id}
                          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <Link to={`/listings/${item.listingId}`} className="block">
                            <div className="relative aspect-[4/3] bg-slate-100">
                              {item.images?.[0] ? (
                                <img
                                  src={item.images[0]}
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
                                <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                                <span className="shrink-0 text-sm font-semibold text-emerald-700">
                                  {money(item.price)}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500">{item.categoryName}</p>
                            </div>
                          </Link>

                          <div className="space-y-3 border-t border-slate-200 p-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                onClick={() => handleAddToCart(item)}
                              >
                                Add to cart
                              </button>

                              <button
                                type="button"
                                onClick={() => removeFromFolder(activeFolder.id, item.listingId)}
                                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Remove from folder
                              </button>
                            </div>

                            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Add to folder
                              </div>
                              <div className="flex gap-2">
                                <select
                                  value={selectedFolderId}
                                  onChange={(e) =>
                                    setTargetFolderByItem((prev) => ({ ...prev, [item.listingId]: e.target.value }))
                                  }
                                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                                >
                                  {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                      {folder.name}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  disabled={addingItemId === item.listingId || alreadyInSelectedFolder}
                                  onClick={() => addItemToFolder(item.listingId, Number(selectedFolderId))}
                                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {addingItemId === item.listingId
                                    ? 'Adding…'
                                    : alreadyInSelectedFolder
                                      ? 'Added'
                                      : 'Add'}
                                </button>
                              </div>
                            </div>
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

      {createModalOpen ? (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create folder</h3>
              <p className="mt-1 text-sm text-slate-500">Enter a name before creating the folder.</p>
            </div>

            <form onSubmit={createFolder} className="space-y-4">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Example: Sneakers"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 text-slate-700"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false)
                    setNewFolderName('')
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFolder}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingFolder ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {cartToast ? (
        <div className="fixed bottom-4 right-4 z-[1200] rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {cartToast}
        </div>
      ) : null}
    </div>
  )
}