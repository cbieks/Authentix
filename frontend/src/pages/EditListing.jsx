import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { resizeListingImage, MAX_LISTING_IMAGES } from '../utils/listingImage'
import './ListingForm.css'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/api/categories').then(setCategories).catch(() => {})
    api(`/api/listings/${id}`)
      .then((data) => setForm({
        categoryId: String(data.categoryId),
        title: data.title,
        description: data.description || '',
        price: String(data.price),
        condition: data.condition || '',
        shippingOption: data.shippingOption || 'SHIP',
        images: data.images || [],
      }))
      .catch(() => setError('Listing not found'))
  }, [id])

  async function handleImageFiles(e) {
    const files = e.target.files ? [...e.target.files] : []
    if (files.length === 0 || !form) return
    setImageUploading(true)
    setError('')
    try {
      const added = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        if (form.images.length + added.length >= MAX_LISTING_IMAGES) break
        const dataUrl = await resizeListingImage(file)
        added.push(dataUrl)
      }
      if (added.length > 0) {
        setForm((f) => ({ ...f, images: [...f.images, ...added].slice(0, MAX_LISTING_IMAGES) }))
      }
    } catch (err) {
      setError(err.message || 'Could not process image.')
    } finally {
      setImageUploading(false)
      e.target.value = ''
    }
  }

  function addImageUrl() {
    if (imageUrl.trim() && form && form.images.length < MAX_LISTING_IMAGES) {
      setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }))
      setImageUrl('')
    }
  }

  function removeImage(i) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      categoryId: Number(form.categoryId),
      title: form.title,
      description: form.description || undefined,
      price: Number(form.price),
      condition: form.condition || undefined,
      shippingOption: form.shippingOption,
      images: form.images,
    }
    api(`/api/listings/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      .then(() => navigate('/account/listings'))
      .catch((err) => setError(err.message || 'Failed to update'))
      .finally(() => setSaving(false))
  }

  if (error && !form) return <div className="layout-main"><p className="listing-form-error">{error}</p></div>
  if (!form) return <div className="layout-main"><p>Loading…</p></div>

  return (
    <div className="listing-form-page">
      <h1>Edit listing</h1>
      <form onSubmit={handleSubmit} className="listing-form">
        {error && <p className="listing-form-error">{error}</p>}
        <label>
          Category *
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>
          Title *
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            maxLength={255}
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
          />
        </label>
        <label>
          Price *
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
        </label>
        <label>
          Condition
          <input
            value={form.condition}
            onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
          />
        </label>
        <label>
          Shipping
          <select
            value={form.shippingOption}
            onChange={(e) => setForm((f) => ({ ...f, shippingOption: e.target.value }))}
          >
            <option value="SHIP">Ship</option>
            <option value="LOCAL_PICKUP">Local pickup</option>
          </select>
        </label>
        <div className="listing-form-photos-section">
          <label>
            Photos (e.g. different angles)
            <div className="listing-form-images">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFiles}
                disabled={form.images.length >= MAX_LISTING_IMAGES || imageUploading}
                className="listing-form-file-input"
                aria-label="Upload listing images"
              />
              <span className="listing-form-images-hint">
                {form.images.length} / {MAX_LISTING_IMAGES} — or paste URL:
              </span>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                disabled={form.images.length >= MAX_LISTING_IMAGES}
              />
              <button type="button" onClick={addImageUrl} disabled={form.images.length >= MAX_LISTING_IMAGES || !imageUrl.trim()}>
                Add URL
              </button>
            </div>
          </label>
          {imageUploading && <p className="listing-form-uploading">Processing…</p>}
          {form.images.length > 0 && (
            <ul className="listing-form-image-list">
              {form.images.map((url, i) => (
                <li key={i}>
                  <img src={url} alt="" className="listing-form-thumb" onError={(e) => e.target.style.display = 'none'} />
                  <button type="button" onClick={() => removeImage(i)}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}
