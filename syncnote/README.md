# syncnote

A small React demo of SkyState authentication and synced user state.

The app calls `useStatus` for authentication and service health. Two
`useUserState` hooks store the user's notes and theme:

```ts
const { value: notes, set: setNotes, syncStatus } =
  useUserState<Note[]>('notes', [])

const { value: theme, set: setTheme } =
  useUserState<Theme>('theme', 'light')
```

The demo supports multiple plain-text notes, automatic syncing, light and dark
themes, note metadata, responsive navigation, connection status, and guarded
sign-out while changes are syncing. Titles and snippets are derived from each
note's body instead of being stored separately.

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
