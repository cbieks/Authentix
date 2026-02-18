import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './AdminVerification.css'

export default function AdminVerification() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setError(null)
    api('/api/admin/listings?verification=PENDING')
      .then((data) => setListings(data.content || []))
      .catch((e) => { setError(e.message || 'Not authorized'); setListings([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function setVerification(id, status) {
    try {
      await api(`/api/admin/listings/${id}/verification?status=${status}`, { method: 'PATCH' })
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className="layout-main"><p>Loading…</p></div>
  if (error) return <div className="layout-main"><p className="admin-error">{error}. Set app.admin-email to your email to access.</p></div>
  return (
    <div className="admin-verification-page">
      <h1>Verification queue</h1>
      <p className="admin-hint">Approve or reject listing verification requests.</p>
      {listings.length === 0 ? (
        <p className="admin-empty">No pending verification requests.</p>
      ) : (
        <ul className="admin-list">
          {listings.map((l) => (
            <li key={l.id} className="admin-item">
              <Link to={`/listings/${l.id}`}>{l.title}</Link>
              <span className="admin-item-price">${Number(l.price).toFixed(2)}</span>
              <div className="admin-item-actions">
                <button type="button" className="admin-btn admin-btn-approve" onClick={() => setVerification(l.id, 'VERIFIED')}>Approve</button>
                <button type="button" className="admin-btn admin-btn-reject" onClick={() => setVerification(l.id, 'UNVERIFIED')}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
