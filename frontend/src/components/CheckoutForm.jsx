import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import './CheckoutForm.css'

export default function CheckoutForm({ listingId, amount, onSuccess, onCancel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setError(null)
    setLoading(true)
    try {
      const returnUrl = `${window.location.origin}/listings/${listingId}?payment=success`
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
      })
      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setLoading(false)
        return
      }
      onSuccess()
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <PaymentElement />
      {error && <p className="checkout-form-error">{error}</p>}
      <div className="checkout-form-actions">
        <button type="button" className="checkout-form-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="checkout-form-submit" disabled={!stripe || loading}>
          {loading ? 'Processing…' : `Pay $${Number(amount).toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}
