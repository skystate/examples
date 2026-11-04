# notes

A small React demo of SkyState authentication and synced user state.

The app calls `useStatus` for authentication and service health. Two
`useUserState` hooks store the user's notes and theme:

```ts
const { value: notes, set: setNotes, syncStatus } =
  useUserState<Note[]>('notes', [])

const { value: preference, set: setPreference } =
  useUserState<'light' | 'dark' | null>('theme', null)
```

The demo supports multiple plain-text notes, automatic syncing, and a Preview
mode with clickable HTTP(S) links. The Settings page offers System, Light, and
Dark appearance; a null preference follows live OS theme changes. Titles and
snippets are derived from each note's body instead of being stored separately.

The workspace waits for the first successful load before showing empty-state
creation controls. A disconnected icon and label replace save status during
network outages, while loaded notes stay available. Ctrl/Cmd+S suppresses the
browser's Save Page dialog because edits already sync automatically. Page close
and sign-out remain guarded while note or theme changes are syncing.

## Run locally

```bash
npm install
npm run dev
```

The SkyState project configuration lives in `src/main.tsx`. Register your local
callback URL in the SkyState console before replacing that configuration.

## Build

```bash
npm run build
```

## Verify

Use Node.js 22.18 or later for the unit tests.

```bash
npm test
npx playwright install chromium
npm run test:browser
```

The browser tests exercise the real SDK against mocked HTTP responses; they do
not require a SkyState account. Set `CHROME_PATH` to use an installed Chrome
binary. If the host has exhausted file watchers, run the browser tests with
`CHOKIDAR_USEPOLLING=true`.
