import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './PublicProfile.css'

export default function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api(`/api/users/${id}`)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="layout-main"><p>Loading…</p></div>
  if (error) return <div className="layout-main"><p className="error">Profile not found.</p></div>
  if (!profile) return null

  return (
    <div className="public-profile-page">
      <div className="public-profile-card">
        {profile.profilePhotoUrl && (
          <img src={profile.profilePhotoUrl} alt="" className="public-profile-photo" />
        )}
        <h1>{profile.displayName || 'Anonymous'}</h1>
        {profile.bio && <p className="public-profile-bio">{profile.bio}</p>}
        {profile.contactVisible && profile.contactInfo && (
          <p className="public-profile-contact"><strong>Contact:</strong> {profile.contactInfo}</p>
        )}
        {profile.contactVisible && !profile.contactInfo && (
          <p className="public-profile-contact muted">No contact info shared.</p>
        )}
        {!profile.contactVisible && (
          <p className="public-profile-contact muted">Contact info is hidden.</p>
        )}
        <p className="public-profile-back"><Link to="/">← Back to home</Link></p>
      </div>
    </div>
  )
}
