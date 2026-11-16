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
  assert.equal(snippet(note(body)), 'milk eggs bread 1. tea quote')
  assert.equal(snippet(note('# Only a title')), 'No additional text')
})

test('title strips at most one block prefix and keeps list numbers', () => {
  assert.equal(title(note('# 1. Introduction')), '1. Introduction')
  assert.equal(title(note('## - draft -')), '- draft -')
  assert.equal(title(note('2024. Year in review')), '2024. Year in review')
  assert.equal(title(note('1. Buy milk')), '1. Buy milk')
})

test('title strips emphasis markers only as a matched pair', () => {
  assert.equal(title(note('file__name__part')), 'file__name__part')
  assert.equal(title(note('snake_case_name')), 'snake_case_name')
  assert.equal(title(note('*foo *')), '*foo *')
  assert.equal(title(note('Using `*args` and `**kwargs`')), 'Using `*args` and `**kwargs`')
})

const links = (body) => noteLinks(body).filter((segment) => segment.href)

test('emphasis markers around a URL stay outside the link', () => {
  const wrapped = ['**https://x.com**', '*https://x.com*', '__https://x.com__', '_https://x.com_', '~~https://x.com~~']
  for (const body of wrapped) {
    assert.equal(noteLinks(body).map((segment) => segment.text).join(''), body)
    assert.deepEqual(links(body).map((link) => link.href), ['https://x.com'], body)
  }
})

test('a URL that is not wrapped keeps its trailing marker characters', () => {
  const urls = [
    'https://docs.python.org/3/reference/datamodel.html#object.__init__',
    'https://host/file.txt~',
    'https://example.com/foo_',
  ]
  for (const url of urls) {
    assert.deepEqual(links(`see ${url} now`).map((link) => link.href), [url])
  }
})
