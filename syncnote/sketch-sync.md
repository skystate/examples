# Sync `src/` to the revised sketch

`sketch.html` (root) supersedes the committed `sketches/index.html` that `src/` was
generated from. `diff -u <(git show HEAD:sketches/index.html) sketch.html` is 36 lines,
covering four design decisions. Everything below is either a consequence of those four,
or drift found while checking them.

Cosmetic nitpicks (aria extras, one-pixel colour-mix differences, whitespace in a
tooltip) are deliberately not listed.

## 1. The four sketch changes

1. **Sync indicator leaves the top bar.** `#sync` deleted from `.topbar`.
2. **Sync indicator lives in the editor header, with its label.** `#sync2` gained
   `<span id="syncText">Saved</span>`, visible on desktop and pip-only under 720px.
   It reports the account's write queue, shown where the writing happens.
3. **No derived title in the editor header.** `#edTitle` is now just `edited 3h ago`,
   and the `.edhead .title b` rule is gone. The first line *is* the title, and it is
   already on screen, so repeating it in the chrome was redundant.
4. **Row delete button vertically centred** via `top:50%; margin-top:-11px`, so it stays
   centred across the taller mobile row.

## 2. Apply to `src/`

- [ ] `TopBar.tsx`: drop `<SyncIndicator>`, and drop the now-unused `syncStatus` prop
      along with its pass-through at `AppShell.tsx:54`.
- [ ] `EditorHeader.tsx`: remove `showLabel={false}`. Hide the label via the mobile
      container query instead, not at every width.
- [ ] `EditorHeader.tsx`: render only `edited {formatRelative(...)}`. Remove the
      `<b>{deriveTitle(...)}</b>`, the leading `·`, the orphaned `deriveTitle` import,
      and the stale comment about the first line sitting below.
- [ ] `NoteListItem.tsx`: centre `.del`, so `top-[10px]` becomes `top-1/2 -mt-[11px]`.

## 3. Drift worth fixing while we're here

- [ ] **Sidebar empty state is mobile-only.** The centred card belongs under 720px.
      Desktop gets the one-line `No notes yet.` (12.5px, `--ink-3`). Keep the
      `role="listbox"` list mounted and hidden rather than unmounting it.
      (`Sidebar.tsx`, `EmptyState.tsx`, where the `pb-15%` is sidebar-only too.)
- [ ] **Container query boundaries are off by one.** Tailwind's `@max-[720px]/app`
      compiles to `width < 720px`, but the sketch means `max-width: 720px`. At exactly
      720px we render desktop, and at 1000px the wrong rail. Use `@max-[721px]`
      equivalents or a custom screen.
- [ ] **FAB:** hide it when the list is empty, since the empty state carries its own
      button, and use the sketch's wider plus rather than the sidebar `PlusIcon` scaled
      up.
- [ ] **Base CSS:** restore `overflow:hidden` on `html,body` and the `14px / 1.5` body
      base. Without them unsized text falls back to 16px.

## 4. Behaviour gaps

Ordered by how much they can cost a user.

- [ ] **Local draft state.** The textarea is fully controlled by the stored body, so
      typing schedules a save but the rendered value lags. Restore `useState` over the
      body and refuse to overwrite it while focused. This is what `todo.md` already
      specifies.
- [ ] **Missing flush triggers:** textarea `blur` and `beforeunload`. Select, create,
      back, sign-out and unmount are wired.
- [ ] **Delete leaves nothing selected.** Re-select the newest remaining note, and only
      null out when the list empties. Same for the initial `selectedId`, which should
      pick the newest on load.
- [ ] **Keyboard.** No handler exists. ⌘N and Escape are both advertised in the UI
      (`Sidebar` tooltip, `EmptyState` hint) and neither works.
- [ ] **`setMobileView('editor')` fires unconditionally.** Guard it on the mobile width.
- [ ] **Focus and caret.** Focus the textarea and put the caret at the end on select,
      and focus after create.
- [ ] **Empty pane condition:** drive it off zero notes, not `note === null`.

Blocked on the SDK rather than a deviation: `skystate.tsx` hardwires
`syncStatus: 'unset'` and `set` is a no-op, so item 2 above is unobservable until the
real provider is wired.

## 5. Follow-ups to `todo.md`

- Flush points list only switch / unmount / logout. Add back, blur, `beforeunload`.
- No line item for the theme toggle or the ⌘N / Escape shortcuts, both of which ship.
- Still no test file or test script, despite the debounce-flush test being called out
  as the correctness test rather than a nicety.
