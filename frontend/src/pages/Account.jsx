import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './Account.css'

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

  function resizeImageToDataUrl(file, maxSize = 300) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        } else {
          width = Math.min(width, maxSize)
          height = Math.min(height, maxSize)
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Could not load image'))
      }
      img.src = url
    })
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setProfilePhotoUrl(dataUrl)
    } catch (err) {
      setMessage('Could not process image.')
    }
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
          <Link to="/account/listings">My listings</Link> · <Link to="/account/watchlist">Watchlist</Link> · <Link to="/account/inbox">Inbox</Link> · <Link to="/listings/new">Create listing</Link>
        </p>
      </div>
    </div>
  )
}
