'use client'

interface StarburstLogoProps {
  size?: number
  color?: string
  className?: string
}

export default function StarburstLogo({
  size = 40,
  color = 'currentColor',
  className = '',
}: StarburstLogoProps) {
  const center = size / 2
  const spokeCount = 16
  const spokeWidth = size * 0.09
  const spokeHeight = size * 0.38
  const spokeOffset = size * 0.14
  const rx = spokeWidth / 2

  const spokes = Array.from({ length: spokeCount }, (_, i) => {
    const angle = (360 / spokeCount) * i
    return (
      <rect
        key={i}
        x={-spokeWidth / 2}
        y={-(spokeOffset + spokeHeight)}
        width={spokeWidth}
        height={spokeHeight}
        rx={rx}
        ry={rx}
        fill={color}
        transform={`rotate(${angle})`}
        style={{ transformOrigin: '0 0' }}
      />
    )
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-center} ${-center} ${size} ${size}`}
      className={className}
      aria-label="Archivo Vivo logo mark"
    >
      {spokes}
    </svg>
  )
}
