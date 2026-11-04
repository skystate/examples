import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

type State = { notes?: { id: string; body: string; updatedAt: number }[]; theme?: string | null }

// Exercise the real provider and SDK with deterministic HTTP responses.
async function backend(page: Page, initialState: State = {}, options: { holdLoad?: boolean; failLoad?: boolean; holdWrites?: boolean; failWrites?: boolean } = {}) {
  let state = structuredClone(initialState)
  let version = 1
  let releaseLoad = () => {}
  const loadGate = options.holdLoad ? new Promise<void>((resolve) => { releaseLoad = resolve }) : Promise.resolve()
  let releaseWrites = () => {}
  const writeGate = options.holdWrites ? new Promise<void>((resolve) => { releaseWrites = resolve }) : Promise.resolve()
  const writes: unknown[] = []
  await page.addInitScript(() => {
    const claims = btoa(JSON.stringify({ sub: 'notes-browser-test', name: 'Notes Test', exp: Math.floor(Date.now() / 1000) + 3600 }))
    localStorage.setItem('skystate:auth:acc_aM0X1lKdzWGJJZyj:examples-notes:development', JSON.stringify({
      access_token: `header.${claims}.signature`, refreshToken: 'test-refresh-token',
    }))
  })
  await page.route('https://api.skystate.io/**', async (route) => {
    const request = route.request()
    if (request.url().includes('/public-state/')) {
      await route.fulfill({ status: 200, json: { state: {} } })
    } else if (request.url().includes('/user-state/')) {
      if (request.method() === 'GET') {
        await loadGate
        if (options.failLoad) {
          await route.abort('failed')
          return
        }
      } else if (request.method() === 'PATCH') {
        await writeGate
        if (options.failWrites) {
          await route.abort('failed')
          return
        }
        const patch = request.postDataJSON()
        writes.push(patch)
        for (const op of patch.ops) {
          const key = op.path.slice(1) as keyof State
          if (op.op === 'remove') delete state[key]
          else Object.assign(state, { [key]: op.value })
        }
        version += 1
      }
      await route.fulfill({ status: 200, headers: { ETag: `"${version}"`, 'Access-Control-Expose-Headers': 'ETag' }, json: { state } })
    } else {
      await route.fulfill({ status: 204 })
    }
  })
  return { releaseLoad: () => releaseLoad(), releaseWrites: () => releaseWrites(), writes, state: () => state }
}

test('initial loading never offers an empty editor or creation action', async ({ page }) => {
  const api = await backend(page, {}, { holdLoad: true })
  await page.goto('./')
  await expect(page.getByText('Loading…', { exact: true })).toBeVisible()
  await expect(page.getByText('Nothing here yet.')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'New note', exact: true })).toHaveCount(0)
  api.releaseLoad()
  await expect(page.getByRole('button', { name: 'New note', exact: true }).first()).toBeVisible()
})

test('account menu theme follows OS changes and persists null for System', async ({ page }) => {
  const api = await backend(page, { theme: 'light' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Notes Test', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'System', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect.poll(() => api.state().theme).toBe(null)
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  if (!await page.getByRole('menu').isVisible()) await page.getByRole('button', { name: 'Notes Test', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click()
  await expect.poll(() => api.state().theme).toBe('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('disconnected indicator stays visible on mobile and recovers online', async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await backend(page)
  await page.goto('./')
  await expect(page.locator('.account-name')).toHaveText('Notes Test')
  await context.setOffline(true)
  await expect(page.getByRole('status')).toHaveText('Disconnected')
  await expect(page.locator('.connection-dot')).toBeVisible()
  await expect(page.getByRole('status')).toHaveAttribute('title', 'Disconnected')
  await expect(page.locator('.status-label')).toHaveCSS('clip-path', 'inset(50%)')
  await page.getByRole('button', { name: 'Notes Test', exact: true }).click()
  for (const control of [page.getByRole('group', { name: 'Theme' }), page.getByRole('menuitem', { name: 'Sign out' })]) {
    const bounds = await control.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
  }
  await context.setOffline(false)
  await expect(page.getByRole('status')).not.toHaveText('Disconnected')
})

test('failed first load shows disconnected without empty-state creation', async ({ page }) => {
  await backend(page, {}, { failLoad: true })
  await page.goto('./')
  await expect(page.getByRole('status')).toHaveText('Disconnected')
  await expect(page.getByText('Nothing here yet.')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'New note', exact: true })).toHaveCount(0)
})

test('URLs are linked during editing and HTML remains plain text', async ({ page }) => {
  const body = 'Links\nSee https://example.com/docs?q=1&x=2 and www.example.org.\n<script>alert(1)</script> javascript:alert(1)'
  await backend(page, { notes: [{ id: 'one', body, updatedAt: 1 }] })
  await page.goto('./')
  const editor = page.getByRole('textbox', { name: 'Note body' })
  await expect.poll(async () => (await editor.locator('.cm-line').allTextContents()).join('\n')).toBe(body)
  await expect(page.getByRole('button', { name: 'Preview', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'https://example.com/docs?q=1&x=2', exact: true })).toHaveAttribute('href', 'https://example.com/docs?q=1&x=2')
  await expect(page.getByRole('link', { name: 'www.example.org', exact: true })).toHaveAttribute('href', 'https://www.example.org')
  await expect(page.locator('.cm-content a')).toHaveCount(2)
  await expect(page.locator('.cm-content script')).toHaveCount(0)
  await editor.fill('Edited https://example.net/new')
  await expect(page.getByRole('link', { name: 'https://example.net/new', exact: true })).toHaveAttribute('href', 'https://example.net/new')
  await expect(page.locator('.cm-content a')).toHaveCount(1)
})

test('Ctrl and Cmd+S suppress browser save while note edits autosave', async ({ page }) => {
  const api = await backend(page, { notes: [{ id: 'one', body: 'Initial', updatedAt: 1 }] })
  await page.goto('./')
  const editor = page.getByRole('textbox', { name: 'Note body' })
  await editor.fill('Updated body')
  await expect.poll(() => api.state().notes?.[0].body).toBe('Updated body')
  for (const modifier of ['ctrlKey', 'metaKey']) {
    expect(await page.evaluate((key) => {
      const event = new KeyboardEvent('keydown', { key: 's', [key]: true, bubbles: true, cancelable: true })
      document.activeElement?.dispatchEvent(event)
      return event.defaultPrevented
    }, modifier)).toBe(true)
  }
})

test('loaded notes remain editable through a failed write and pending writes guard sign-out', async ({ page }) => {
  await backend(page, { notes: [{ id: 'one', body: 'Initial', updatedAt: 1 }] }, { failWrites: true })
  await page.goto('./')
  const editor = page.getByRole('textbox', { name: 'Note body' })
  await editor.fill('Keep this pending edit')
  await expect(page.getByRole('status')).toHaveText('Disconnected')
  await expect(editor).toHaveText('Keep this pending edit')
  await expect(page.getByRole('button', { name: 'New note', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Notes Test', exact: true }).click()
  const confirmation = page.waitForEvent('dialog')
  const signOut = page.getByRole('menuitem', { name: 'Sign out', exact: true }).click()
  const dialog = await confirmation
  expect(dialog.message()).toContain('Changes are still syncing')
  await dialog.dismiss()
  await signOut
  await expect(editor).toHaveText('Keep this pending edit')
  expect(await page.evaluate(() => {
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    return event.defaultPrevented
  })).toBe(true)
})

test('theme changes report Saving and restore Saved after confirmation', async ({ page }) => {
  const api = await backend(page, { notes: [{ id: 'one', body: 'Saved note', updatedAt: 1 }] }, { holdWrites: true })
  await page.goto('./')
  await expect(page.getByRole('status')).toHaveText('Saved')
  if (!await page.getByRole('menu').isVisible()) await page.getByRole('button', { name: 'Notes Test', exact: true }).click()
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Saving')
  api.releaseWrites()
  await expect(page.getByRole('status')).toHaveText('Saved')
  await expect.poll(() => api.state().theme).toBe('dark')
})

test('account menu exposes styled theme controls inline and supports keyboard navigation', async ({ page }) => {
  await backend(page, { notes: [{ id: 'one', body: 'My note', updatedAt: 1 }], theme: 'light' })
  await page.goto('./')
  await expect(page.getByRole('status')).toHaveText('Saved')
  const trigger = page.getByRole('button', { name: 'Notes Test', exact: true })
  await expect(page.getByRole('menu')).toHaveCount(0)
  await trigger.focus()
  await trigger.press('ArrowDown')
  await expect(page.getByRole('menuitemradio', { name: 'System', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('menuitemradio', { name: 'Light', exact: true })).toBeFocused()
  await expect(page.getByRole('menuitemradio', { name: 'Light', exact: true })).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowRight')
  const dark = page.getByRole('menuitemradio', { name: 'Dark', exact: true })
  await expect(dark).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dark).toHaveAttribute('aria-checked', 'true')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByRole('menu')).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Settings' })).toHaveCount(0)
  await page.keyboard.press('End')
  await expect(page.getByRole('menuitem', { name: 'Sign out', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('textbox', { name: 'Note body' })).toHaveText('My note')
  await trigger.click()
  await page.locator('.wordmark').click()
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('links open with Control or Command while ordinary clicks keep editing', async ({ page, context }) => {
  const body = 'Visit https://example.com/docs today'
  await backend(page, { notes: [{ id: 'one', body, updatedAt: 1 }] })
  await context.route('https://example.com/**', (route) => route.fulfill({ body: 'Linked page' }))
  await page.goto('./')
  const link = page.locator('.cm-content a')
  await link.hover()
  await expect(link).toHaveCSS('cursor', 'text')
  for (const modifier of ['Control', 'Meta'] as const) {
    await page.keyboard.down(modifier)
    await expect(link).toHaveCSS('cursor', 'pointer')
    await page.keyboard.up(modifier)
    await expect(link).toHaveCSS('cursor', 'text')
  }
  await page.keyboard.down('Control')
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(link).toHaveCSS('cursor', 'text')
  await page.keyboard.up('Control')
  await link.click()
  await expect(page.getByRole('link', { name: /Open link:/ })).toBeVisible()
  expect(context.pages()).toHaveLength(1)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /Open link:/ })).toBeFocused()
  for (const modifier of ['Control', 'Meta'] as const) {
    const opened = page.waitForEvent('popup')
    await link.click({ modifiers: [modifier] })
    const popup = await opened
    await expect(popup).toHaveURL('https://example.com/docs')
    await popup.close()
  }
  await expect(page.getByRole('textbox', { name: 'Note body' })).toHaveText(body)
  await link.click()
  const opened = page.waitForEvent('popup')
  await page.keyboard.press('Control+Enter')
  const popup = await opened
  await expect(popup).toHaveURL('https://example.com/docs')
  await popup.close()
})

test('touch users open links without a modifier and header controls fit a narrow screen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 844 }, hasTouch: true, isMobile: true })
  const page = await context.newPage()
  await backend(page, { notes: [{ id: 'one', body: 'Visit https://example.com/mobile today', updatedAt: 1 }] })
  await context.route('https://example.com/**', (route) => route.fulfill({ body: 'Linked page' }))
  await page.goto('./')
  await page.getByRole('button', { name: 'Visit https://example.com/mobile today', exact: false }).first().tap()
  await page.locator('.cm-content a').tap()
  const openLink = page.getByRole('link', { name: /Open link:/ })
  await expect(openLink).toBeVisible()
  const opened = page.waitForEvent('popup')
  await openLink.tap()
  const popup = await opened
  await expect(popup).toHaveURL('https://example.com/mobile')
  await popup.close()
  await page.getByRole('button', { name: 'Notes Test', exact: true }).tap()
  await expect(page.getByRole('group', { name: 'Theme' })).toBeVisible()
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).tap()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  const menuBounds = (await page.getByRole('menu').boundingBox())!
  expect(menuBounds.x).toBeGreaterThanOrEqual(0)
  expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(320)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  await context.close()
})

test('plain-text editing preserves multiline input, undo and note switching', async ({ page }) => {
  const api = await backend(page, { notes: [
    { id: 'one', body: 'First note', updatedAt: 1 },
    { id: 'two', body: 'Second note', updatedAt: 1 },
  ] })
  await page.goto('./')
  const editor = page.getByRole('textbox', { name: 'Note body' })
  await editor.press('ControlOrMeta+End')
  await editor.press('Enter')
  await page.keyboard.insertText('  https://example.com/next')
  await expect.poll(() => api.state().notes?.[0].body).toBe('First note\n  https://example.com/next')
  await expect(page.locator('.cm-content a')).toHaveText('https://example.com/next')
  await editor.press('ControlOrMeta+z')
  await expect(page.locator('.cm-content a')).toHaveCount(0)
  await page.getByRole('button', { name: 'Second note No additional text', exact: true }).click()
  await expect(editor).toHaveText('Second note')
  await page.getByRole('button', { name: /^First note/ }).first().click()
  await expect.poll(async () => (await editor.locator('.cm-line').allTextContents()).join('\n')).toBe(api.state().notes?.[0].body)
})
