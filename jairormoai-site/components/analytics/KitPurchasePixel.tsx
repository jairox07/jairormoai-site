'use client'

import Script from 'next/script'

declare global {
  interface Window {
    kitTrack?: (event: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) => void
  }
}

// Dispara el evento Purchase del píxel de Meta una sola vez por compra (US$19, Kit Editor IA).
export function KitPurchasePixel({ sessionId }: { sessionId: string }) {
  return (
    <Script
      src="/kit-editor-ia/pixel.js"
      strategy="afterInteractive"
      onReady={() => {
        try {
          const key = `kit-purchase-${sessionId}`
          if (localStorage.getItem(key)) return
          window.kitTrack?.('Purchase', { value: 19, currency: 'USD', content_name: 'Kit Editor IA' }, { eventID: sessionId })
          localStorage.setItem(key, '1')
        } catch {
          // sin almacenamiento: no pasa nada
        }
      }}
    />
  )
}
