import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting, syntaxTree } from '@codemirror/language'
import type { EditorState, Range } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { tags } from '@lezer/highlight'

const styles = HighlightStyle.define([
  { tag: tags.heading1, class: 'md-heading md-h1' },
  { tag: tags.heading2, class: 'md-heading md-h2' },
  { tag: tags.heading3, class: 'md-heading md-h3' },
  { tag: [tags.heading4, tags.heading5, tags.heading6], class: 'md-heading' },
  { tag: tags.strong, class: 'md-strong' },
  { tag: tags.emphasis, class: 'md-emphasis' },
  { tag: tags.strikethrough, class: 'md-strike' },
  { tag: tags.monospace, class: 'md-code' },
  { tag: tags.processingInstruction, class: 'md-mark' },
])

class Checkbox extends WidgetType {
  readonly checked: boolean
  constructor(checked: boolean) {
    super()
    this.checked = checked
  }
  eq(other: Checkbox) { return other.checked === this.checked }
  toDOM() {
    const wrap = document.createElement('span')
    wrap.className = 'md-task'
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.checked = this.checked
    box.setAttribute('aria-label', 'Done')
    wrap.append(box)
    return wrap
  }
  ignoreEvent() { return false }
}

const hidden = Decoration.replace({})
const hiddenMarks = ['EmphasisMark', 'StrikethroughMark']

function selectionTouchesLine(state: EditorState, position: number) {
  const line = state.doc.lineAt(position)
  return state.selection.ranges.some((range) => range.from <= line.to && range.to >= line.from)
}

// The opening # run with the space after it, or the closing # run with the space before it.
function headerMarkRange(state: EditorState, from: number, to: number, opening: boolean) {
  if (opening) {
    const spaceAfter = state.sliceDoc(to, to + 1) === ' '
    return hidden.range(from, spaceAfter ? to + 1 : to)
  }
  const spaceBefore = state.sliceDoc(from - 1, from) === ' '
  return hidden.range(spaceBefore ? from - 1 : from, to)
}

function build(view: EditorView) {
  const { state } = view
  const ranges: Range<Decoration>[] = []
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name === 'TaskMarker') {
          const checked = state.sliceDoc(node.from + 1, node.from + 2) !== ' '
          ranges.push(Decoration.replace({ widget: new Checkbox(checked) }).range(node.from, node.to))
          return
        }
        if (selectionTouchesLine(state, node.from)) return
        if (hiddenMarks.includes(node.name)) ranges.push(hidden.range(node.from, node.to))
        // Setext headings keep their underline; only ATX # runs are hidden.
        const heading = node.name === 'HeaderMark' ? node.node.parent : null
        if (heading?.name.startsWith('ATXHeading')) {
          ranges.push(headerMarkRange(state, node.from, node.to, node.from === heading.from))
        }
      },
    })
  }
  return Decoration.set(ranges, true)
}

const markers = ViewPlugin.fromClass(class {
  decorations: DecorationSet
  constructor(view: EditorView) { this.decorations = build(view) }
  update(update: ViewUpdate) {
    const treeChanged = syntaxTree(update.startState) !== syntaxTree(update.state)
    if (update.docChanged || update.selectionSet || update.viewportChanged || treeChanged) {
      this.decorations = build(update.view)
    }
  }
}, {
  decorations: (plugin) => plugin.decorations,
  provide: (plugin) => EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
  eventHandlers: {
    click: (event, view) => {
      const box = event.target as HTMLElement
      if (!box.matches('.md-task input')) return false
      const position = view.posAtDOM(box) + 1
      const insert = view.state.sliceDoc(position, position + 1) === ' ' ? 'x' : ' '
      view.dispatch({ changes: { from: position, to: position + 1, insert } })
      event.preventDefault()
      return true
    },
  },
})

export const noteMarkdown = [markdown({ base: markdownLanguage }), syntaxHighlighting(styles), markers]
