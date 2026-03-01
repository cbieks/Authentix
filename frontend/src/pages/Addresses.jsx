import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import './Addresses.css'

export default function Addresses() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: '', isDefault: false })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [addMode, setAddMode] = useState(false)

  function loadAddresses() {
    setLoading(true)
    api('/api/addresses')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => loadAddresses(), [])

  function openNew() {
    setEditingId(null)
    setForm({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: '', isDefault: list.length === 0 })
    setError(null)
    setMessage(null)
  }

  function openEdit(addr) {
    setAddMode(false)
    setEditingId(addr.id)
    setForm({
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'US',
      phone: addr.phone || '',
      isDefault: addr.isDefault === true,
    })
    setError(null)
    setMessage(null)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const body = {
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim() || undefined,
      postalCode: form.postalCode.trim(),
      country: (form.country || 'US').toUpperCase().slice(0, 2),
      phone: form.phone.trim() || undefined,
      isDefault: form.isDefault,
    }
    const promise = editingId
      ? api(`/api/addresses/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) })
      : api('/api/addresses', { method: 'POST', body: JSON.stringify(body) })
    promise
      .then(() => {
        setMessage(editingId ? 'Address updated.' : 'Address added.')
        setEditingId(null)
        loadAddresses()
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false))
  }

  function setAsDefault(id) {
    const addr = list.find((a) => a.id === id)
    if (!addr || addr.isDefault) return
    setSaving(true)
    api(`/api/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isDefault: true }),
    })
      .then(() => {
        setMessage('Default address updated.')
        loadAddresses()
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false))
  }

  function deleteAddress(id) {
    if (!window.confirm('Delete this address?')) return
    setSaving(true)
    api(`/api/addresses/${id}`, { method: 'DELETE' })
      .then(() => {
        setMessage('Address deleted.')
        if (editingId === id) setEditingId(null)
        loadAddresses()
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false))
  }

  const showForm = editingId !== null || addMode || list.length === 0

  return (
    <div className="addresses-page">
      <h1>Shipping addresses</h1>
      <p className="addresses-intro">Use these for checkout. Your full address is never shown to sellers for discovery.</p>
      <p className="addresses-links"><Link to="/account">← Account</Link></p>

      {message && <p className="addresses-message success">{message}</p>}
      {error && <p className="addresses-message error">{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <ul className="addresses-list">
            {list.map((a) => (
              <li key={a.id} className={`addresses-item ${a.isDefault ? 'default' : ''}`}>
                <div className="addresses-item-text">
                  {a.line1}
                  {a.line2 && `, ${a.line2}`}
                  <br />
                  {a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode} {a.country}
                  {a.phone && ` · ${a.phone}`}
                  {a.isDefault && <span className="addresses-badge">Default</span>}
                </div>
                <div className="addresses-item-actions">
                  {!a.isDefault && (
                    <button type="button" onClick={() => setAsDefault(a.id)} disabled={saving}>Set default</button>
                  )}
                  <button type="button" onClick={() => openEdit(a)} disabled={saving}>Edit</button>
                  <button type="button" onClick={() => deleteAddress(a.id)} disabled={saving} className="addresses-delete">Delete</button>
                </div>
              </li>
            ))}
          </ul>
          {list.length === 0 && !showForm && <p className="addresses-empty">No addresses yet. Add one below.</p>}

          {showForm && (
            <form onSubmit={handleSubmit} className="addresses-form">
              <h2>{editingId ? 'Edit address' : 'Add address'}</h2>
              <label>Street address * <input value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} required maxLength={255} /></label>
              <label>Apt, suite (optional) <input value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} maxLength={255} /></label>
              <label>City * <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required maxLength={100} /></label>
              <label>State <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} maxLength={100} /></label>
              <label>ZIP / postal code * <input value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} required maxLength={20} /></label>
              <label>Country * <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="US" maxLength={2} /></label>
              <label>Phone <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} maxLength={50} /></label>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                Default shipping address
              </label>
              <div className="addresses-form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Saving…' : (editingId ? 'Save changes' : 'Add address')}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: '', isDefault: false }); }}>Cancel</button>}
                {!editingId && list.length > 0 && <button type="button" onClick={() => { setAddMode(false); setForm({ line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: '', isDefault: false }); }}>Cancel</button>}
              </div>
            </form>
          )}
          {!showForm && list.length > 0 && (
            <button type="button" className="addresses-add-btn" onClick={openNew}>Add new address</button>
          )}
        </>
      )}
    </div>
  )
}
