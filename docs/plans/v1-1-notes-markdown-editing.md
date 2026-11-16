# Plan: Markdown editing in the notes example

> Last updated: 2026-11-16

# Phase 1: Scope [DRAFT]

## Context

The notes example (`notes/`) stores each note as one plain string and edits it in CodeMirror 6 as
plain text. The owner wants markdown: headings, bold, italic, lists and checklists.

Chosen approach (owner, 2026-11-16): the user types markdown and the editor formats it live. The
existing CodeMirror editor stays. The alternative, a toolbar editor that hides markdown completely
(Tiptap), was rejected because it replaces the editor, forces a rewrite of most browser tests, and
rewrites the stored text on save.

What the app does after this plan:

1. **Live styling.** While typing, headings show larger and bold, `**bold**` shows bold, `*italic*`
   shows italic, `~~strike~~` shows struck through, list and quote markers show muted. Enter inside a
   list or checklist item starts the next item. Enter on an empty item ends the list.
2. **Clean look off the cursor line.** On lines that do not hold the cursor or selection, the marker
   characters of headings (`#`), bold and italic (`**`, `*`, `_`) and strikethrough (`~~`) are
   hidden. Moving the cursor onto a line shows its markers again.
3. **Clickable checklists.** `- [ ]` and `- [x]` show as a checkbox. Clicking or tapping it flips
   the one character in the note body. This goes through the same save path as typing.
4. **Clean sidebar.** The sidebar title and snippet, the editor header, the delete button label and
   the delete confirm text show the text without markdown markers (`# Shopping` shows as
   `Shopping`).
5. **Links keep working.** Bare URLs stay clickable exactly as today, also when wrapped in bold or
   italic markers.

What does not change: the `Note` type, the stored value (one markdown string per note), the
SkyState calls, the sync logic, and the rule that note content is never turned into HTML.

Scope calls recorded here, to confirm at lock:

- **Markdown link syntax `[text](url)` is styled but not collapsed.** It stays visible as typed.
  Collapsing it overlaps with the existing bare-URL link feature and is most of the edge cases.
  Inline code backticks, list bullets and quote markers also stay visible (muted).
- **No toolbar.** The owner picked the type-markdown option. A toolbar that inserts markdown
  characters was offered as an add-on and not picked.
- **Base branch is `master`.** See "In-flight work" below.

## Research Findings

All paths are relative to `notes/` unless they start with `.github/` or `docs/`.

### Editor (`src/NoteBody.tsx`, 148 lines)

- `externalChange` annotation: `src/NoteBody.tsx:8`.
- `linksIn(body)`: `:10-17`. Turns `noteLinks(body)` segments into `{from, to, href}` ranges.
- `linkAtCursor(state)`: `:21-25`. Scans the whole document on each call.
- `linkMarks`: `:27-41`. A `ViewPlugin.fromClass` that rebuilds only on `docChanged`, scans the
  whole document, and emits `Decoration.mark` with `tagName: 'a'`.
- `linkTooltip`: `:43-62`. `showTooltip.computeN(['selection', 'doc'], ...)`.
- `NoteBody` component: `:64-148`. Extensions in order (`:77-114`): `history()`,
  `drawSelection()`, `EditorView.lineWrapping`, `placeholder(...)` (`:79`), `contentAttributes`
  (`:80`, `aria-label: 'Note body'`), `keymap.of([Mod-Enter, ...defaultKeymap, ...historyKeymap])`
  (`:81-89`, default precedence), `linkMarks`, `linkTooltip` (`:90`), `domEventHandlers`
  (`:91-108`), `updateListener` (`:109-113`).
- `domEventHandlers`: `mousedown` only acts when Ctrl/Meta is held on an `a`. `click` only acts on
  an `a` inside `.cm-content` (`:99-107`). Neither touches other targets, so a checkbox handler
  does not collide with them.
- Save path: the update listener calls `onChange(doc.toString())` on every document change that is
  not tagged `externalChange` (`:109-113`). There is no debounce in the app.
- Remote overwrite: `:137-145`. If `doc.toString() !== body`, it replaces the whole document with
  `externalChange.of(true)` and `Transaction.addToHistory.of(false)`. Because the document is the
  stored string, this guard stays correct with markdown.
- `NoteBody` is lazy-loaded (`src/Editor.tsx:6`) and keyed by `note.id` (`src/Editor.tsx:46`).

### Links (`src/noteLinks.ts`, 37 lines)

- Regex at `:17`: `/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi`. `trimPunctuation` (`:3-12`) strips
  trailing `.,!?;:` and unbalanced closing brackets. It does not strip `*`, `_` or `~`.
- **Existing defect that markdown makes visible:** `**https://x.com**` yields the href
  `https://x.com**`. This plan fixes it (strip trailing `*`, `_`, `~` in `trimPunctuation`).
- Only `http:` and `https:` pass `new URL` validation. Comment at `:14`: segments are returned
  "rather than HTML so note content is always escaped".

### Title and snippet (`src/note.ts`, 10 lines, no imports)

- `title`: first line trimmed, or `'Note'` (`:7`). `snippet`: remaining lines joined with spaces,
  or `'No additional text'` (`:9-10`).
- Call sites: `src/App.tsx:76` (sidebar title), `:77` (snippet), `:82` (delete aria-label), `:174`
  (delete confirm), `src/Editor.tsx:43` (editor header).
- `src/App.tsx` and `src/Editor.tsx:3` import `note.ts` statically. Anything `note.ts` imports
  lands in the main chunk, not the lazy editor chunk.

### Styling (`src/editor.css`, 48 lines)

- All selectors are `.note-body` / `.cm-*`. Georgia 1.1rem, line-height 1.7 (`:15-20`). Link
  styles at `:28-30`. Mobile padding at `:45-48`. No heading or emphasis styles exist.
- Colours come from CSS variables (`--text`, `--accent`, `--muted`, `--line`, `--panel`) switched
  by `html[data-theme]`.

### Tests

- Unit: `tests/editor.test.mjs` (43 lines), run by `node --test tests/*.test.mjs`
  (`package.json:6-12`). It imports `../src/noteLinks.ts` and `../src/saveShortcut.ts` directly
  through Node type stripping. A unit-tested source file therefore cannot have extensionless
  relative imports. `note.ts` has no imports today and no tests.
- Browser: `tests/browser/notes.spec.ts` (291 lines), Playwright against the Vite dev server on
  port 4173 (`playwright.config.ts:3-13`), SkyState API mocked.
- Editor selector everywhere: `page.getByRole('textbox', { name: 'Note body' })`.
- No existing test body contains markdown markers, so existing assertions keep passing as long as:
  - the markdown layer never emits an `<a>` (assertions on `.cm-content a` at `:119`, `:123`,
    `:213`, `:254`, `:284`, `:286`);
  - Enter on a plain paragraph still inserts a plain newline (`:281-283`).
- Assertions that compare editor text to the raw body (`:115`, `:147`, `:156`, `:202`, `:238`,
  `:288`, `:290`) read `textContent`. Hidden markers are removed from the DOM, so new tests with
  markers must compare against the saved body in the mocked API, not the editor text.
- Test names that say "plain text": `:110`, `:273`.
- CI on `master` (`.github/workflows/deploy.yml`) runs `npm ci` and `npm run build` only. It runs
  no tests.

### Wording that says "plain text"

- `src/App.tsx:20`: "Plain-text notes that follow you across devices."
- `src/NoteBody.tsx:79`: placeholder "Start typing. The first line becomes the title."
- `README.md:16` and `README.md:19-20`.

### Dependencies

- Direct today (`package.json:12-14`): `@codemirror/commands ^6.11.1`, `@codemirror/state ^6.7.6`,
  `@codemirror/view ^6.43.15`.
- Already in the lockfile as transitive: `@codemirror/language` 6.13.1, `@lezer/highlight` 1.2.5,
  `@lezer/common` 1.5.5.
- To add as direct: `@codemirror/lang-markdown` (6.5.2), `@codemirror/language` (6.13.1),
  `@lezer/highlight` (1.2.5). All MIT.
- `@codemirror/lang-markdown` pulls in `@codemirror/lang-html` and `@codemirror/autocomplete`, and
  there is no option to leave HTML support out (`@codemirror/lang-markdown@6.5.2 dist/index.js:402,
  407`). They land only in the lazy editor chunk (287 KB today). Size impact was not measured.
- No lint config and no bundle budget exist. Only `tsc -b` checks the code.

### In-flight work

- Branch `sdk-3.0.0` (worktree `.worktrees/sdk-3.0.0`, 5 commits ahead of `master`, unmerged)
  changes `package.json`, `package-lock.json`, `tests/browser/notes.spec.ts`, `README.md`,
  `src/App.tsx` and adds `.github/workflows/test.yml`. It does not touch `src/NoteBody.tsx` or
  `src/note.ts`. Whichever of the two lands second has to resolve conflicts in the lockfile, the
  spec file and the README.
- Branch `fix/notes-open-issues` has the same tree as `master`.

### Norms

The repo has no `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING`, checklist or conventions document. The
READMEs describe the example as small and self-contained (`../README.md:3`, `../README.md:9`).

### Alternatives checked

| Alternative | Result |
|---|---|
| Use the parser's GFM Autolink instead of `noteLinks.ts` | Rejected. Autolink only produces syntax nodes: no `<a>`, no href check, no Ctrl-click, no tooltip. The existing feature and its tests stay. |
| Reuse the markdown parser for `title()` / `snippet()` | Rejected. It would pull the parser into the main chunk and break the import-free shape that lets `node --test` load `note.ts`. A small regex per line does the job. |
| Third-party live-preview plugins (`codemirror-live-markdown`, `@prosemark/core`, `ink-mde`) | Rejected. Alpha or stale, about 1k-2k weekly downloads. |
| Hide every marker, including link syntax, code backticks and quote marks | Not chosen. See the scope call in Context. |

## Tech Briefs

Sources: installed packages under `node_modules/`, and the npm tarballs of
`@codemirror/lang-markdown@6.5.2` and `@lezer/markdown@1.8.1` (not installed yet). The executor
can re-check each locator after `npm install`.

### `@codemirror/lang-markdown` (6.5.2)

`markdown(config)` returns the language support extension. Its `base` option defaults to
`commonmarkLanguage` (`dist/index.d.ts:93-96`), which has no task lists or strikethrough. This plan
passes `markdown({ base: markdownLanguage })`; `markdownLanguage` is "GFM plus subscript,
superscript, and emoji" (`dist/index.d.ts:11-15`, `dist/index.js:63-74`).

`addKeymap` defaults to true and installs `markdownKeymap` at `Prec.high` (`dist/index.js:424`):
Enter runs `insertNewlineContinueMarkup`, Backspace runs `deleteMarkupBackward`
(`dist/index.d.ts:56-62`). It runs before the app keymap at `src/NoteBody.tsx:81` and falls through
to `defaultKeymap` when it does not apply, so no keymap reordering is needed. Enter in a task item
continues with `- [ ] ` and resets a checked box to unchecked (`dist/index.js:146, 154`). Bullet
lists only; ordered-list tasks are UNVERIFIED.

### `@lezer/markdown` (1.8.1) node names

Markers are separate child nodes, so each is hidden by its own range. Names used by this plan:
`ATXHeading1`..`ATXHeading6`, `HeaderMark` (`src/markdown.ts:54-59, 495-497`; `HeaderMark` also
covers the trailing `#` run of a closed heading), `Emphasis`, `StrongEmphasis`, `EmphasisMark`
(`src/markdown.ts:1418-1419, 1737`), `Strikethrough`, `StrikethroughMark` (`src/extension.ts:5,
11-17`), `Task`, `TaskMarker` (`src/extension.ts:139-163`), `ListMark`, `QuoteMark`
(`src/markdown.ts:84-85`).

`TaskMarker` covers exactly the three characters `[ ]` or `[x]`. The character to flip is at
`TaskMarker.from + 1`. The list dash is a separate `ListMark` sibling.

### `@codemirror/language` (6.13.1) and `@lezer/highlight` (1.2.5)

`syntaxHighlighting(HighlightStyle.define([...]))` turns parser tags into CSS classes or inline
styles (`node_modules/@codemirror/language/dist/index.d.ts:866, 893`). Tags the markdown parser
assigns (`@lezer/markdown@1.8.1 src/markdown.ts:1963-1986`, `src/extension.ts:11-17, 155-156`):
headings `heading1`..`heading6`, bold `strong`, italic `emphasis`, strikethrough `strikethrough`,
inline code `monospace`, lists `list`, quotes `quote`, URLs `url`, every marker character
`processingInstruction` (a child of `meta`), task marker `atom`.

`syntaxTree(state)` returns the current, possibly incomplete tree (`dist/index.d.ts:183`). The
parser may stop beyond the visible viewport (`dist/index.d.ts:199`). Decorations that read the tree
must cover only `view.visibleRanges` and rebuild when the tree changes
(`syntaxTree(update.startState) != syntaxTree(update.state)`, https://codemirror.net/examples/decoration/,
"ViewPlugin decorations").

### `@codemirror/view` (6.43.15) decorations and widgets

`Decoration.replace` "replaces the given range with a widget, or simply hides it"
(`node_modules/@codemirror/view/dist/index.d.ts:80`). Decorations from a `ViewPlugin` "must not
introduce block widgets or replacing decorations that cover line breaks" (`:1310-1316`). Every
range this plan hides sits inside one line, so a `ViewPlugin` is allowed, the same shape as the
existing `linkMarks` plugin.

A hide-off-cursor-line plugin must rebuild on `docChanged`, `selectionSet` (`:601`),
`viewportChanged` (`:572`) and tree change. `EditorView.atomicRanges` makes cursor movement skip
hidden ranges (`:1342-1351`); the exact `provide` call shape is UNVERIFIED and to be checked
against the installed `.d.ts`.

`WidgetType`: `toDOM(view)` (`:209`), `eq(other)` defaults to false and should compare the checked
state (`:219`), `ignoreEvent` must return false so the click reaches the handler (`:247`). The
official checkbox example wraps the `<input type="checkbox">` in a `<span>` for Firefox and
toggles through `view.dispatch({ changes })` in a `mousedown` handler
(https://codemirror.net/examples/decoration/, "Toggling and dispatch"). The widget should carry its
own document position or recompute it from the tree; what `view.posAtDOM` returns for a replaced
range is UNVERIFIED.

### Node type stripping for unit tests

`tests/editor.test.mjs:3-4` imports `.ts` source files directly. `tsconfig.json:26`
(`erasableSyntaxOnly`) keeps that safe, and `README.md:50` requires Node 22.18 or later. New pure
helpers that need unit tests (marker stripping in `note.ts`, the `trimPunctuation` fix) must stay
free of extensionless relative imports and of CodeMirror imports.
