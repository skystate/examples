import test from 'node:test'
import assert from 'node:assert/strict'
import { noteLinks } from '../src/noteLinks.ts'
import { suppressSaveShortcut } from '../src/saveShortcut.ts'

test('preview links HTTP, HTTPS and www addresses without changing note text', () => {
  const body = 'Links\nhttp://localhost:3000/path https://example.com/?a=1&b=2 www.example.org'
  const segments = noteLinks(body)
  assert.equal(segments.map((segment) => segment.text).join(''), body)
  assert.deepEqual(segments.filter((segment) => segment.href).map((segment) => segment.href), [
    'http://localhost:3000/path', 'https://example.com/?a=1&b=2', 'https://www.example.org',
  ])
})

test('sentence punctuation stays outside links while balanced URL parentheses remain', () => {
  const body = 'See [(https://example.com/a)]. Also https://example.com/wiki/Example_(test)!'
  const segments = noteLinks(body)
  assert.equal(segments.map((segment) => segment.text).join(''), body)
  assert.deepEqual(segments.filter((segment) => segment.href).map((segment) => segment.text), [
    'https://example.com/a', 'https://example.com/wiki/Example_(test)',
  ])
})

test('preview never creates links for executable schemes or raw HTML', () => {
  const body = '<script>alert(1)</script> javascript:alert(1) data:text/html,alert(1) https://'
  const segments = noteLinks(body)
  assert.equal(segments.map((segment) => segment.text).join(''), body)
  assert.equal(segments.some((segment) => segment.href), false)
})

test('save shortcut prevents browser save for Control and Command including uppercase S', () => {
  for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { ctrlKey: true, shiftKey: true }]) {
    let prevented = false
    suppressSaveShortcut({ key: 'S', ...modifiers, preventDefault: () => { prevented = true } })
    assert.equal(prevented, true)
  }
})

test('ordinary typing, Alt shortcuts and other commands retain browser behavior', () => {
  for (const event of [{ key: 's' }, { key: 's', ctrlKey: true, altKey: true }, { key: 'p', metaKey: true }]) {
    suppressSaveShortcut({ ...event, preventDefault: () => assert.fail('Unexpected preventDefault') })
  }
})
