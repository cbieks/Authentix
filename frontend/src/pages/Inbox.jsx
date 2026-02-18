import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './Inbox.css'

export default function Inbox() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api('/api/users/me/inbox')
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function markRead(id) {
    try {
      await api(`/api/messages/${id}/read`, { method: 'PATCH' })
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
    } catch (e) {}
  }

  if (loading) return <div className="layout-main"><p>Loading…</p></div>
  return (
    <div className="inbox-page">
      <h1>Inbox</h1>
      {messages.length === 0 ? (
        <p className="inbox-empty">No messages yet. When buyers ask about your listings, they’ll appear here.</p>
      ) : (
        <ul className="inbox-list">
          {messages.map((m) => (
            <li key={m.id} className={`inbox-item ${m.read ? '' : 'inbox-item-unread'}`}>
              <Link to={`/listings/${m.listingId}`} className="inbox-item-link" onClick={() => !m.read && markRead(m.id)}>
                <span className="inbox-item-listing">{m.listingTitle}</span>
                <span className="inbox-item-from">From: {m.senderDisplayName || 'User'}</span>
                <p className="inbox-item-body">{m.body || '(no text)'}</p>
                <time className="inbox-item-time">{new Date(m.createdAt).toLocaleString()}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
