# legal
https://tmsearch.uspto.gov/search/search-results/88561997
https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&basicSearch=skystate

# syncnote minimal scope
A personal notepad. React + SkyState hosted auth and user state.

Grounded in `3_specification.md` (SkyState Requirements V2.13). Section refs below point there.

## Constraints (from the spec, not choices)

- **React only.** `@skystate/core` and `@skystate/react` are Shipped. Svelte and Vue are Planned (§5.2).
- **Hosted auth only.** Google and GitHub, PKCE redirect. No login component ships, so we render our own button (§3.1, §9).
- **Top-level keys only.** `useUserState<T>(key, fallback)`. Keys cannot contain `/` or `~`. There are no nested paths (§5.2).
- **Fixed environments.** `development` / `staging` / `production` (§4.2). Use `development` locally.
- **Last-write-wins, no realtime.** Concurrent editing of one field is out of scope (§9). Two open tabs clobber rather than merge, which we accept.

## Data model

One key, one array:

```ts
useUserState<Note[]>('notes', [])
type Note = { id: string; body: string; updatedAt: number }
```

- `id` from `crypto.randomUUID()`.
- **Title is derived, never stored:** `body.split('\n')[0].trim() || 'Untitled'`.
- Single key means create-note and list-update are one atomic write, so the list cannot desync from the bodies.
- Cost: every save resends all notes. Bounded and acceptable at this size. **Scaling exit:** split into `note_<id>` bodies plus a `noteIndex` key when it hurts.

## Build

- [ ] Vite + React + TypeScript scaffold
- [ ] SkyState project: providers, branding, callback URLs registered (console)
- [ ] `SkyStateProvider` with `account` / `project` / `environment="development"` / `callbackUrl`
- [ ] Auth gate via `useStatus().auth`: login button when unauthenticated, `logout` when authenticated
- [ ] `useNotes`, sole owner of the `notes` key, exposing `list`, `create`, `update`, `remove`
- [ ] `NoteList`: sorted by `updatedAt` desc, derived titles, new and delete
- [ ] `NoteEditor`: textarea over local `useState`, no `draft` API
- [ ] Auto-save on a 1s idle debounce calling `useNotes.update()`
- [ ] **Flush pending debounce on note switch, back (mobile), textarea `blur`, `beforeunload`, unmount, and logout** (see Risks)
- [ ] Save indicator from `syncStatus` (`'unset' | 'syncing' | 'synced'`)
- [ ] One error banner: `useStatus().health.status === 'error'`
- [ ] `ThemeToggle` in the top bar, flipping `data-theme` between `light` and `dark`
- [ ] Keyboard: `⌘N` (and `Ctrl+N`) creates a note; `Escape` goes back to the list on mobile, otherwise blurs the textarea

## Error handling, deliberately minimal

- One banner from `health`. Nothing per-operation.
- No retry logic. The SDK queues and retries with capped jittered backoff on its own (§8.3).
- The identity verdict (401/403 clears the queue and marks state `unloaded`, §5.2) needs no handling. `auth.status` flips off `'authenticated'` and the existing gate renders the login button.

## Tests

- `useNotes` against `createMemoryStorage()` (§3.3 ships this helper for exactly this).
- Title derivation, including empty and whitespace-only first lines.
- Debounce flush on switch and unmount. This is the correctness test, not a nicety.
- No E2E in v1.

## Out of scope

Rename (the title is the first line), folders, tags, search, markdown preview, sharing, offline support, multi-tab reconciliation.

## Risks

- **An unflushed debounce loses the last edit** on note switch, back (mobile), textarea `blur`, `beforeunload`, unmount, or logout. This is the one real correctness hazard introduced by dropping the `draft` API. Covered by an explicit build item and a test above.
- **Version history is blocked, not deferred.** §5.2 states that SDK v1 does not expose server-side write provenance, `version`, `meta`, ETags, or history APIs. The `/versions` endpoint (§4.0) is public-state only, and the user-state routes (§4.3) have no history endpoint at all. It is not on the SkyState roadmap. The app-side workaround, if you want it later, is writing our own snapshots to a separate key.
