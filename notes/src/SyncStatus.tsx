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
    <span className={`connection-status ${status}`} role="status" aria-live="polite">
      {disconnected ? (
        <svg className="disconnected-icon" aria-hidden="true" viewBox="0 0 20 20">
          <path d="m3 3 14 14M2.5 7a12 12 0 0 1 2.8-1.7M8.2 4.5A12 12 0 0 1 17.5 7M5.2 10a7.5 7.5 0 0 1 3.1-1.4M11.8 8.6a7.5 7.5 0 0 1 3 1.4M8 13a3 3 0 0 1 4 0" />
          <circle cx="10" cy="16" r="0.75" />
        </svg>
      ) : (
        <span className="connection-dot" aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  )
}
