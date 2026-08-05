type IconProps = { className?: string }

/** The syncnote mark: a rounded square with two rules. */
export function Glyph({ className }: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0.75"
        y="0.75"
        width="14.5"
        height="14.5"
        rx="3.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="3" y="4" width="10" height="1.5" fill="currentColor" />
      <rect x="3" y="8" width="10" height="1.5" fill="currentColor" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  )
}

/** The FAB's plus: longer arms and a heavier stroke than the sidebar's. */
export function PlusLargeIcon({ className }: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 2.8v10.4M2.8 8h10.4" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 4.5h10M6.5 4.5V3.2h3v1.3M4.4 4.5l.5 8.3h6.2l.5-8.3" />
    </svg>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 4.5 6.5 10l5.5 5.5" />
    </svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 4.5 13.5 10 8 15.5" />
    </svg>
  )
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r="3.6" />
      <path d="M10 1.8v1.8M10 16.4v1.8M18.2 10h-1.8M3.6 10H1.8M15.8 4.2l-1.3 1.3M5.5 14.5l-1.3 1.3M15.8 15.8l-1.3-1.3M5.5 5.5 4.2 4.2" />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7.5 7.5 0 1 0 8.9 8.9z" />
    </svg>
  )
}
