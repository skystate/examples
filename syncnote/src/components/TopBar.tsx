import AccountMenu from './AccountMenu'
import ThemeToggle from './ThemeToggle'
import Wordmark from './Wordmark'

type TopBarProps = {
  userInitials: string
  onSignOut: () => void
}

// No sync indicator here: it reports the account's write queue, so it lives in
// the editor header, where the writing happens.
export default function TopBar({ userInitials, onSignOut }: TopBarProps) {
  return (
    <header className="flex h-[52px] flex-none items-center gap-4 border-b border-line bg-panel px-6 @max-mobile/app:h-14 @max-mobile/app:px-4">
      <Wordmark size="bar" />
      <ThemeToggle />
      <AccountMenu initials={userInitials} onSignOut={onSignOut} />
    </header>
  )
}
