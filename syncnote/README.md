# syncnote

A minimal personal notepad that syncs across devices. Built with React and
[SkyState](https://skystate.dev) hosted auth and user state.

Sign in with Google or GitHub, write notes, and they follow you to any browser.
This repo contains no backend code: persistence, auth, and sync are all handled
by SkyState.

## Features

- **Plain-text notes.** The first line of a note is its title, so there is nothing else to manage.
- **Auto-save.** Edits are saved on a short idle debounce, and a sync indicator shows the write queue state.
- **Cross-device sync.** Notes are stored as SkyState user state, scoped to your account.
- **Responsive.** A two-pane layout on desktop becomes a list/editor stack on mobile.
- **Light and dark themes**, with a toggle in the top bar.
- **Keyboard shortcuts.** `⌘N` / `Ctrl+N` creates a note; `Escape` goes back on mobile or drops focus elsewhere.

## Tech stack

- [React 19](https://react.dev) + TypeScript, bundled with [Vite](https://vite.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [`@skystate/react`](https://www.npmjs.com/package/@skystate/react) for auth and synced state

## Running locally

```bash
npm install
npm run dev
```

The app is configured against a SkyState project in `src/main.tsx`
(`account`, `project`, `environment`). To run your own instance, create a
project in the SkyState console, register your callback URL, and update those
props.

## Building

```bash
npm run build    # type-checks and builds to dist/
npm run preview  # serve the production build locally
```

Pushes to `master` deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## How it works

All notes live under a single SkyState user-state key:

```ts
useUserState<Note[]>('notes', [])
type Note = { id: string; body: string; updatedAt: number }
```

One key means creating a note and updating the list is a single atomic write,
so the list can never desync from the note bodies. Titles are derived from the
first line of the body and never stored. Sync is last-write-wins; concurrent
editing of the same note in two tabs is out of scope.

## License

No license has been granted yet. All rights reserved.
