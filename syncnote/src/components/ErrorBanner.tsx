export default function ErrorBanner() {
  return (
    <div
      role="status"
      className="z-40 flex flex-none items-center gap-3 border-b border-bad/20 bg-bad-bg px-6 py-2.5 text-[13px] text-bad @max-mobile/app:px-4 @max-mobile/app:py-[9px] @max-mobile/app:text-[12.5px]"
    >
      <span className="size-1.5 flex-none rounded-full bg-bad" />
      <span>
        <b>Can't reach SkyState.</b>{' '}
        <span className="text-bad/70 @max-mobile/app:hidden">
          Your edits are saved locally and will sync when the connection returns.
        </span>
      </span>
    </div>
  )
}
