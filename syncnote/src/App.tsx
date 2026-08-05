import { useCallback, useEffect, useState } from 'react'
import AppShell from './components/AppShell'
import LandingPage from './components/LandingPage'
import { useNotes } from './hooks/useNotes'
import { useStatus } from '@skystate/react'

// The sketch measured its device frame; the real app container is full-width,
// so the viewport is the thing to measure against the same 720px boundary.
const isMobile = () => window.matchMedia('(max-width: 720px)').matches

// name → up to two word-initials; else the email's first letter; else empty,
// which renders a blank avatar. Some providers omit the name claim, and email
// can be null on others.
const initialsFrom = (name: string | null, email: string | null) => {
  const fromName = (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  return (fromName || email?.[0] || '').toUpperCase()
}

export default function App() {
  // Hooks run unconditionally, before the auth branch, because the rules of
  // hooks do not care that the signed-out tree never reads any of this.
  const { auth, health } = useStatus()
  const { notes, syncStatus, create, update, remove } = useNotes()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list')
  // Bumped only where the editor should take focus; 0 means "do not". The
  // editor cannot just focus on mount: it remounts per note, including on the
  // delete and load paths, where stealing focus would pop the mobile keyboard.
  const [focusTick, setFocusTick] = useState(0)

  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id)
      // Only mobile has a second view to push; on desktop both are on screen.
      if (isMobile()) setMobileView('editor')
      // Mobile deliberately does not take focus: tapping a row is often reading,
      // and the keyboard would cover the thing you tapped to read.
      setFocusTick((tick) => (isMobile() ? 0 : tick + 1))
    },
    [],
  )

  const onCreate = useCallback(() => {
    setSelectedId(create())
    if (isMobile()) setMobileView('editor')
    setFocusTick((tick) => tick + 1)
  }, [create])

  const onDelete = useCallback(
    (id: string) => {
      remove(id)
      // Deleting what you were reading should land on the newest survivor, not
      // on nothing. `notes` is sorted by updatedAt desc, so that is the first
      // one that is not the corpse.
      setSelectedId((current) =>
        current === id ? (notes.find((n) => n.id !== id)?.id ?? null) : current,
      )
      // Landing on the survivor is not a request to type in it, and the editor
      // remounts here, so the tick has to be stood down explicitly.
      setFocusTick(0)
      setMobileView('list')
    },
    [notes, remove],
  )

  const onBack = useCallback(() => {
    setMobileView('list')
  }, [])

  const onChangeBody = useCallback(
    (body: string) => {
      if (selectedId !== null) update(selectedId, body)
    },
    [selectedId, update],
  )

  const onSignOut = useCallback(() => {
    auth.logout()
  }, [auth])

  // Notes arrive asynchronously from SkyState, so the opening selection cannot
  // be a lazy useState initialiser. No focus bump: landing on a note should not
  // pop the mobile keyboard.
  useEffect(() => {
    if (selectedId === null && notes.length > 0) setSelectedId(notes[0].id)
  }, [notes, selectedId])

  // Both shortcuts are already advertised in the UI (the sidebar tooltip and
  // the empty state hint), so they have to work.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // The landing page has no notes to create in, and a selection made
      // there would outlive the sign-in.
      if (auth.status !== 'authenticated') return
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        onCreate()
      }
      if (event.key === 'Escape') {
        // On mobile the editor covers the list, so Escape is the back button.
        // Everywhere else it drops focus, which flushes on the way out.
        if (isMobile() && mobileView === 'editor') onBack()
        else (document.activeElement as HTMLElement | null)?.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [auth.status, mobileView, onBack, onCreate])

  // This branch is the auth gate. It stands in for what would otherwise be a
  // separate AuthGate component. The landing page owns nothing auth-shaped:
  // provider choice lives on SkyState's hosted page, reached via
  // loginWithRedirect().
  if (auth.status !== 'authenticated') {
    return (
      <LandingPage
        authenticating={auth.status === 'authenticating'}
        onLogIn={() => void auth.loginWithRedirect()}
      />
    )
  }

  return (
    <AppShell
      health={health.status}
      userInitials={initialsFrom(auth.name, auth.email)}
      mobileView={mobileView}
      notes={notes}
      selectedId={selectedId}
      syncStatus={syncStatus}
      focusTick={focusTick}
      onSelect={onSelect}
      onCreate={onCreate}
      onDelete={onDelete}
      onBack={onBack}
      onChangeBody={onChangeBody}
      onSignOut={onSignOut}
    />
  )
}
