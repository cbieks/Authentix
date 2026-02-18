import { useEffect } from 'react'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID

export function loadAnalytics() {
  if (GA_ID) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID)
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(s)
  }
  if (ADSENSE_CLIENT) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
    s.crossOrigin = 'anonymous'
    document.head.appendChild(s)
  }
}

export function AdSlot({ slotId, format = 'auto', className = '' }) {
  useEffect(() => {
    try {
      if (window.adsbygoogle && slotId) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (e) {}
  }, [slotId])
  if (!ADSENSE_CLIENT) return null
  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
