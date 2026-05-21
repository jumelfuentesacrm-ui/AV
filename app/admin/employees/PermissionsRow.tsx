'use client'

import { useTransition } from 'react'
import type { EmployeePermissions } from '@/types'

interface PermissionsRowProps {
  userId: string
  permissions: EmployeePermissions | null
  permKeys: string[]
  permLabels: Record<string, string>
  updatePermission: (formData: FormData) => Promise<void>
}

export default function PermissionsRow({
  userId,
  permissions,
  permKeys,
  permLabels,
  updatePermission,
}: PermissionsRowProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (permKey: string, currentValue: boolean) => {
    const fd = new FormData()
    fd.set('user_id', userId)
    fd.set('permission', permKey)
    fd.set('value', String(!currentValue))
    startTransition(() => {
      updatePermission(fd)
    })
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {permKeys.map((key) => {
        const value = permissions ? !!(permissions[key as keyof EmployeePermissions] as boolean) : false
        return (
          <button
            key={key}
            onClick={() => handleToggle(key, value)}
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: value ? 'rgba(201,168,112,0.12)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${value ? 'rgba(201,168,112,0.4)' : 'rgba(0,0,0,0.1)'}`,
              cursor: isPending ? 'default' : 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--f-mono)',
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
              color: value ? '#C9A870' : '#8C7B6B',
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: value ? '#C9A870' : 'rgba(0,0,0,0.15)',
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            {permLabels[key]}
          </button>
        )
      })}
    </div>
  )
}
