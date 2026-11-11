'use client'

import Script from 'next/script'

declare global {
  interface Window {
    kitTrack?: (event: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) => void
  }
}

// Dispara el evento Purchase del píxel de Meta una sola vez por compra (no se dispara en compras de prueba con cupón de 100 %).
export function KitPurchasePixel({ sessionId, value }: { sessionId: string; value: number }) {
  return (
    <Script
      src="/kit-editor-ia/pixel.js"
      strategy="afterInteractive"
      onReady={() => {
        try {
          const key = `kit-purchase-${sessionId}`
          if (localStorage.getItem(key)) return
          window.kitTrack?.('Purchase', { value, currency: 'USD', content_name: 'Kit Editor IA' }, { eventID: sessionId })
          localStorage.setItem(key, '1')
        } catch {
          // sin almacenamiento: no pasa nada
        }
      }}
    />
  )
}
