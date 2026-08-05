import { PlusLargeIcon } from './icons'

type NewNoteFabProps = {
  onCreate: () => void
}

export default function NewNoteFab({ onCreate }: NewNoteFabProps) {
  return (
    <button
      type="button"
      onClick={onCreate}
      aria-label="New note"
      className="absolute right-[18px] bottom-[calc(22px+env(safe-area-inset-bottom,0px))] z-[35] hidden h-[52px] w-[52px] place-items-center rounded-full bg-ink text-panel shadow-[0_6px_20px_-6px_rgba(0,0,0,.35)] active:scale-[.94] @max-mobile/app:grid"
    >
      <PlusLargeIcon className="h-5 w-5" />
    </button>
  )
}
