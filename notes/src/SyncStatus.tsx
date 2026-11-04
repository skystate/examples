import { useEffect, useState } from 'react'
import type { SkyStateHealth, UserStateSyncStatus } from '@skystate/react'
import './sync-status.css'

export function useBrowserOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    update()
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return online
}

type SyncStatusProps = {
  health: SkyStateHealth
  syncStatus: UserStateSyncStatus
  online: boolean
}

export function SyncStatus({ health, syncStatus, online }: SyncStatusProps) {
  const disconnected = !online || (health.status === 'error' && (
    health.error.code === 'no_response' || health.error.code === 'server_unavailable'
  ))
  const status = disconnected ? 'disconnected'
    : health.status === 'error' ? 'error'
    : health.status === 'loading' ? 'connecting'
    : syncStatus
  const label = status === 'disconnected' ? 'Disconnected'
    : status === 'error' ? 'Sync unavailable'
    : status === 'connecting' ? 'Connecting…'
    : status === 'syncing' ? 'Saving'
    : status === 'synced' ? 'Saved'
    : 'Not saved yet'

  return (
    <span className={`connection-status ${status}`} role="status" aria-live="polite" title={label}>
      <span className="connection-dot" aria-hidden="true" />
      <span className="status-label">{label}</span>
    </span>
  )
}
