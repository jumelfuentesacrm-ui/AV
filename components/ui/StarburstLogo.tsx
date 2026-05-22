'use client'

interface StarburstLogoProps {
  size?: number
  color?: string
  className?: string
}

const RAY_PATH = 'M 46 10 A 4 4 0 0 1 54 10 L 50.75 38 L 49.25 38 Z'
const ANGLES = Array.from({ length: 18 }, (_, i) => i * 20)

export default function StarburstLogo({
  size = 40,
  color = 'currentColor',
  className = '',
}: StarburstLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Sol logo mark"
    >
      <g fill={color}>
        {ANGLES.map((angle) => (
          <path
            key={angle}
            transform={`rotate(${angle} 50 50)`}
            d={RAY_PATH}
          />
        ))}
      </g>
    </svg>
  )
}
