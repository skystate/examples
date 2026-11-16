import test from 'node:test'
import assert from 'node:assert/strict'
import { snippet, title } from '../src/note.ts'
import { noteLinks } from '../src/noteLinks.ts'

const note = (body) => ({ id: 'one', body, updatedAt: 1 })

test('title drops heading, emphasis and list markers', () => {
  assert.equal(title(note('# Shopping')), 'Shopping')
  assert.equal(title(note('### **Big** *plans* and ~~old~~ _ideas_')), 'Big plans and old ideas')
  assert.equal(title(note('- [ ] milk')), 'milk')
  assert.equal(title(note('> quoted')), 'quoted')
  assert.equal(title(note('# ')), 'Note')
})

test('title keeps characters that are not markdown markers', () => {
  assert.equal(title(note('2 * 3 * 4 = 24')), '2 * 3 * 4 = 24')
  assert.equal(title(note('rename snake_case_name #1')), 'rename snake_case_name #1')
})

test('snippet drops markers on every remaining line', () => {
  const body = '# List\n- [ ] milk\n- [x] **eggs**\n* bread\n1. ~~tea~~\n> _quote_'
  assert.equal(snippet(note(body)), 'milk eggs bread tea quote')
  assert.equal(snippet(note('# Only a title')), 'No additional text')
})

test('emphasis markers around a URL stay outside the link', () => {
  for (const body of ['**https://x.com**', '_https://x.com_ and ~~https://x.com~~']) {
    const segments = noteLinks(body)
    const links = segments.filter((segment) => segment.href)
    assert.equal(segments.map((segment) => segment.text).join(''), body)
    assert.notEqual(links.length, 0)
    for (const link of links) assert.equal(link.href, 'https://x.com')
  }
})
