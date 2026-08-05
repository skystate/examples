import { Glyph } from './icons'

type WordmarkProps = {
  size?: 'bar' | 'hero'
}

export default function Wordmark({ size = 'bar' }: WordmarkProps) {
  const hero = size === 'hero'
  return (
    <div
      className={
        hero
          ? 'mb-3 inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[0.16em]'
          : 'mr-auto flex items-center gap-2.5 text-[14px] font-semibold tracking-[0.14em]'
      }
    >
      <Glyph className={hero ? 'size-[18px] shrink-0' : 'size-4 shrink-0'} />
      syncnote
    </div>
  )
}
