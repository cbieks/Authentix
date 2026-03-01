import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './Account.css'

const PROFILE_PHOTO_SIZE = 120
const CROP_PREVIEW_SIZE = 280

export default function Account() {
  const { user, updateProfile, refetchUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [displayName, setDisplayName] = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('')
  const [bio, setBio] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [contactVisible, setContactVisible] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [payoutsLoading, setPayoutsLoading] = useState(false)
  const [cropState, setCropState] = useState(null)
  const cropDragRef = useRef({ isDragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 })

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '')
      setProfilePhotoUrl(user.profilePhotoUrl ?? '')
      setBio(user.bio ?? '')
      setContactInfo(user.contactInfo ?? '')
      setContactVisible(user.contactVisible ?? true)
    }
  }, [user])

  useEffect(() => {
    if (searchParams.get('stripe') === 'success') {
      refetchUser()
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, refetchUser, setSearchParams])

  useEffect(() => {
    if (!cropState) return
    const onMove = (e) => handleCropPointerMove(e)
    const onUp = () => handleCropPointerUp()
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [cropState])

  async function handleSetUpPayouts() {
    setPayoutsLoading(true)
    try {
      const data = await api('/api/stripe/connect/onboard', { method: 'POST' })
      if (data?.url) window.location.href = data.url
      else setMessage('Could not start payout setup.')
    } catch (err) {
      setMessage(err.message || 'Could not start payout setup.')
    } finally {
      setPayoutsLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      await updateProfile({
        displayName: displayName || undefined,
        profilePhotoUrl: profilePhotoUrl || undefined,
        bio: bio || undefined,
        contactInfo: contactInfo || undefined,
        contactVisible,
      })
      setMessage('Profile saved.')
    } catch (err) {
      setMessage(err.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const loadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = src
    })
  }, [])

  function openCropModal(file) {
    const url = URL.createObjectURL(file)
    loadImage(url).then((img) => {
      const { width, height } = img
      const scale = Math.max(CROP_PREVIEW_SIZE / width, CROP_PREVIEW_SIZE / height)
      const scaledW = width * scale
      const scaledH = height * scale
      const initialPanX = Math.max(0, (scaledW - CROP_PREVIEW_SIZE) / 2)
      const initialPanY = Math.max(0, (scaledH - CROP_PREVIEW_SIZE) / 2)
      setCropState({
        imageSrc: url,
        imageWidth: width,
        imageHeight: height,
        scale,
        panX: initialPanX,
        panY: initialPanY,
        scaledWidth: scaledW,
        scaledHeight: scaledH,
        isLarge: width > PROFILE_PHOTO_SIZE || height > PROFILE_PHOTO_SIZE,
      })
    }).catch(() => {
      URL.revokeObjectURL(url)
      setMessage('Could not load image.')
    })
  }

  function closeCropModal() {
    if (cropState?.imageSrc) URL.revokeObjectURL(cropState.imageSrc)
    setCropState(null)
  }

  function handleCropPointerDown(e) {
    if (!cropState) return
    cropDragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, startPanX: cropState.panX, startPanY: cropState.panY }
  }

  function handleCropPointerMove(e) {
    if (!cropState || !cropDragRef.current.isDragging) return
    const { startX, startY, startPanX, startPanY } = cropDragRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const maxPanX = Math.max(0, cropState.scaledWidth - CROP_PREVIEW_SIZE)
    const maxPanY = Math.max(0, cropState.scaledHeight - CROP_PREVIEW_SIZE)
    setCropState((prev) => ({
      ...prev,
      panX: Math.max(0, Math.min(maxPanX, startPanX - dx)),
      panY: Math.max(0, Math.min(maxPanY, startPanY - dy)),
    }))
  }

  function handleCropPointerUp() {
    cropDragRef.current.isDragging = false
  }

  async function applyCrop() {
    if (!cropState) return
    try {
      const img = await loadImage(cropState.imageSrc)
      const canvas = document.createElement('canvas')
      canvas.width = PROFILE_PHOTO_SIZE
      canvas.height = PROFILE_PHOTO_SIZE
      const ctx = canvas.getContext('2d')
      const srcScale = cropState.scale
      const srcX = cropState.panX / srcScale
      const srcY = cropState.panY / srcScale
      const srcSize = CROP_PREVIEW_SIZE / srcScale
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, PROFILE_PHOTO_SIZE, PROFILE_PHOTO_SIZE)
      setProfilePhotoUrl(canvas.toDataURL('image/jpeg', 0.88))
      closeCropModal()
    } catch (err) {
      setMessage('Could not apply crop.')
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    openCropModal(file)
    e.target.value = ''
  }

  const triggerPhotoInput = () => document.getElementById('account-photo-input')?.click()

  return (
    <div className="account-page">
      <h1>My account</h1>
      <div className="account-card">
        <p className="account-email">Email: {user?.email}</p>
        <div className="account-photo-wrap">
          <input
            id="account-photo-input"
            type="file"
            accept="image/*"
            className="account-photo-input"
            onChange={handlePhotoChange}
            aria-label="Change profile photo"
          />
          <button type="button" className="account-photo-circle" onClick={triggerPhotoInput} aria-label="Change profile photo">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="" onError={(e) => (e.target.style.display = 'none')} />
            ) : (
              <span className="account-photo-placeholder">Photo</span>
            )}
          </button>
          <p className="account-photo-hint">Tap to take a photo or upload</p>
        </div>
        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              placeholder="How you appear on the site"
            />
          </label>
          <label>
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="A short bio for your profile"
            />
          </label>
          <label>
            Contact info
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              maxLength={200}
              placeholder="Email, phone, or other contact"
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={contactVisible}
              onChange={(e) => setContactVisible(e.target.checked)}
            />
            Show contact info on my public profile
          </label>
          {message && <p className={`profile-message ${message.startsWith('Profile') ? 'success' : 'error'}`}>{message}</p>}
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
        </form>
        <div className="account-payouts">
          <h3 className="account-payouts-title">Seller payouts</h3>
          {user?.payoutsEnabled ? (
            <p className="account-payouts-done">Payouts enabled — you can receive payments when buyers purchase your listings.</p>
          ) : (
            <>
              <p className="account-payouts-desc">Connect a Stripe account to receive payouts when you sell items.</p>
              <button type="button" className="account-payouts-btn" onClick={handleSetUpPayouts} disabled={payoutsLoading}>
                {payoutsLoading ? 'Redirecting…' : 'Set up payouts'}
              </button>
            </>
          )}
        </div>
        <p className="account-links">
          <Link to="/account/listings">My listings</Link> · <Link to="/account/watchlist">Watchlist</Link> · <Link to="/account/inbox">Inbox</Link> · <Link to="/account/addresses">Addresses</Link> · <Link to="/listings/new">Create listing</Link>
        </p>
      </div>

      {cropState && (
        <div className="crop-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="crop-modal-title">
          <div className="crop-modal">
            <h2 id="crop-modal-title" className="crop-modal-title">
              {cropState.isLarge ? 'Position your photo inside the circle' : 'Position your photo'}
            </h2>
            {cropState.isLarge && (
              <p className="crop-modal-hint">Drag the image so it fits the circle, then click Apply.</p>
            )}
            <div
              className="crop-preview-wrap"
              style={{ width: CROP_PREVIEW_SIZE, height: CROP_PREVIEW_SIZE }}
              onPointerDown={handleCropPointerDown}
            >
              <div
                className="crop-preview-inner"
                style={{
                  left: -cropState.panX,
                  top: -cropState.panY,
                  width: cropState.scaledWidth,
                  height: cropState.scaledHeight,
                  backgroundImage: `url(${cropState.imageSrc})`,
                  backgroundSize: `${cropState.scaledWidth}px ${cropState.scaledHeight}px`,
                }}
              />
            </div>
            <div className="crop-modal-actions">
              <button type="button" className="crop-btn crop-btn-cancel" onClick={closeCropModal}>Cancel</button>
              <button type="button" className="crop-btn crop-btn-apply" onClick={applyCrop}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
