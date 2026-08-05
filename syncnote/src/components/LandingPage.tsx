import Wordmark from './Wordmark'

type LandingPageProps = {
  // True while the SDK is completing the PKCE exchange after the redirect
  // back from auth.skystate.io; the button must not invite a second login.
  authenticating: boolean
  onLogIn: () => void
}

export default function LandingPage({ authenticating, onLogIn }: LandingPageProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg p-6">
      <div className="w-full max-w-[400px] text-center">
        <Wordmark size="hero" />
        <h1 className="mb-3 font-serif text-[28px] leading-[1.25] tracking-[-0.01em]">
          A notepad that remembers.
        </h1>
        <p className="mb-8 text-[13.5px] leading-[1.7] text-ink-3">
          Plain-text notes that follow you across devices.
        </p>
        <button
          type="button"
          onClick={onLogIn}
          disabled={authenticating}
          className="h-11 rounded-r2 bg-accent px-7 text-[14px] font-medium text-white hover:opacity-90 active:opacity-80 disabled:opacity-60"
        >
          {authenticating ? 'Signing you in…' : 'Log in'}
        </button>
      </div>
    </main>
  )
}
