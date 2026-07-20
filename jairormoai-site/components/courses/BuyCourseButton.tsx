'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { GUIA_CLAUDE_STRIPE_LINK } from '@/lib/constants'

interface BuyCourseButtonProps {
  courseSlug: string
  stripePriceId: string
  isLoggedIn: boolean
  freeUntil?: string
  firstLessonId?: string
  customCheckoutLink?: string
}

export function BuyCourseButton({
  courseSlug,
  stripePriceId,
  isLoggedIn,
  freeUntil,
  firstLessonId,
  customCheckoutLink,
}: BuyCourseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isFreeNow = !!freeUntil && new Date(freeUntil) > new Date()

  const onClick = async () => {
    if (!isLoggedIn) {
      router.push(`/signup?redirect=/courses/${courseSlug}`)
      return
    }

    if (isFreeNow) {
      setLoading(true)
      const res = await fetch('/api/courses/enroll-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug }),
      })
      const data = await res.json()
      if (data.ok) {
        const dest = firstLessonId
          ? `/courses/${courseSlug}/${firstLessonId}`
          : `/courses/${courseSlug}?enrolled=true`
        router.push(dest)
      } else {
        setLoading(false)
      }
      return
    }

    if (customCheckoutLink) {
      window.location.href = customCheckoutLink
      return
    }

    if (!stripePriceId) {
      window.location.href = GUIA_CLAUDE_STRIPE_LINK
      return
    }

    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseSlug, stripePriceId }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  const label = isFreeNow
    ? isLoggedIn ? 'Inscribirme gratis' : 'Regístrate — es gratis'
    : isLoggedIn ? 'Comprar curso' : 'Acceder para comprar'

  return (
    <Button variant="primary" size="lg" loading={loading} onClick={onClick}>
      {label}
    </Button>
  )
}
