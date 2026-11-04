import { useLayoutEffect, useRef } from 'react'
import { Annotation, EditorState, Transaction } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { Decoration, EditorView, ViewPlugin, drawSelection, keymap, placeholder, showTooltip } from '@codemirror/view'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { noteLinks } from './noteLinks'

const externalChange = Annotation.define<boolean>()

function linksIn(body: string) {
  let offset = 0
  return noteLinks(body).flatMap((segment) => {
    const from = offset
    offset += segment.text.length
    return segment.href ? [{ from, to: offset, href: segment.href }] : []
  })
}

const linkHint = 'Ctrl/Cmd+click to open. Or place the cursor in a link and choose Open link.'

function linkAtCursor(state: EditorState) {
  if (!state.selection.main.empty) return undefined
  const position = state.selection.main.head
  return linksIn(state.doc.toString()).find(({ from, to }) => position >= from && position <= to)
}

const linkMarks = ViewPlugin.fromClass(class {
  decorations: DecorationSet
  constructor(view: EditorView) { this.decorations = this.build(view) }
  update(update: ViewUpdate) {
    if (update.docChanged) this.decorations = this.build(update.view)
  }
  build(view: EditorView) {
    return Decoration.set(linksIn(view.state.doc.toString()).map(({ from, to, href }) =>
      Decoration.mark({
        tagName: 'a',
        attributes: { href, target: '_blank', rel: 'noopener noreferrer', title: linkHint, tabindex: '-1' },
      }).range(from, to),
    ))
  }
}, { decorations: (plugin) => plugin.decorations })

const linkTooltip = showTooltip.computeN(['selection', 'doc'], (state) => {
  const link = linkAtCursor(state)
  if (!link) return []
  return [{
    pos: link.from,
    above: true,
    create: () => {
      const dom = document.createElement('div')
      dom.className = 'open-link-tooltip'
      const anchor = document.createElement('a')
      anchor.href = link.href
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
      anchor.textContent = 'Open link ↗'
      anchor.setAttribute('aria-label', `Open link: ${link.href} (new tab)`)
      dom.append(anchor)
      return { dom }
    },
  }]
})

export default function NoteBody({ body, onChange }: { body: string; onChange: (body: string) => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)

  useLayoutEffect(() => { onChangeRef.current = onChange }, [onChange])

  useLayoutEffect(() => {
    const view = new EditorView({
      parent: hostRef.current!,
      state: EditorState.create({
        doc: body,
        selection: { anchor: body.length },
        extensions: [
          history(), drawSelection(), EditorView.lineWrapping,
          placeholder('Start typing. The first line becomes the title.'),
          EditorView.contentAttributes.of({ 'aria-label': 'Note body', spellcheck: 'true' }),
          keymap.of([{
            key: 'Mod-Enter',
            run: (editor) => {
              const link = linkAtCursor(editor.state)
              if (!link) return false
              window.open(link.href, '_blank', 'noopener,noreferrer')
              return true
            },
          }, ...defaultKeymap, ...historyKeymap]),
          linkMarks, linkTooltip,
          EditorView.domEventHandlers({
            mousedown: (event) => {
              if ((event.ctrlKey || event.metaKey) && (event.target as Element).closest('a')) {
                event.preventDefault()
                return true
              }
              return false
            },
            click: (event) => {
              const link = (event.target as Element).closest<HTMLAnchorElement>('a')
              if (!link?.closest('.cm-content')) return false
              event.preventDefault()
              if (event.ctrlKey || event.metaKey || event.detail === 0) {
                window.open(link.href, '_blank', 'noopener,noreferrer')
              }
              return true
            },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(externalChange))) {
              onChangeRef.current(update.state.doc.toString())
            }
          }),
        ],
      }),
    })
    viewRef.current = view
    const updateLinkCursor = (event: KeyboardEvent | PointerEvent) => {
      view.dom.classList.toggle('cm-follow-links', event.ctrlKey || event.metaKey)
    }
    const resetLinkCursor = () => view.dom.classList.remove('cm-follow-links')
    window.addEventListener('keydown', updateLinkCursor, true)
    window.addEventListener('keyup', updateLinkCursor, true)
    window.addEventListener('blur', resetLinkCursor)
    view.dom.addEventListener('pointermove', updateLinkCursor)
    view.focus()
    return () => {
      window.removeEventListener('keydown', updateLinkCursor, true)
      window.removeEventListener('keyup', updateLinkCursor, true)
      window.removeEventListener('blur', resetLinkCursor)
      view.dom.removeEventListener('pointermove', updateLinkCursor)
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    const view = viewRef.current
    if (view && view.state.doc.toString() !== body) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: body },
        annotations: [externalChange.of(true), Transaction.addToHistory.of(false)],
      })
    }
  }, [body])

  return <div className="note-body" ref={hostRef} />
}
