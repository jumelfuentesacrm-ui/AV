'use client'

import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => {
      if (!el.classList.contains('in')) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return null
}
