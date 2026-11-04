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

test('settings follow OS changes and persist null for System', async ({ page }) => {
  const api = await backend(page, { theme: 'light' })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('./')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.getByRole('radio', { name: 'System', exact: true }).check()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect.poll(() => api.state().theme).toBe(null)
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await expect.poll(() => api.state().theme).toBe('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Back to notes' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toHaveCount(0)
})

test('disconnected indicator stays visible on mobile and recovers online', async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await backend(page)
  await page.goto('./')
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible()
  await context.setOffline(true)
  await expect(page.getByRole('status')).toHaveText('Disconnected')
  await expect(page.locator('.disconnected-icon')).toBeVisible()
  await expect(page.getByText('Disconnected', { exact: true })).toBeVisible()
  for (const label of ['Settings', 'Sign out']) {
    const bounds = await page.getByRole('button', { name: label, exact: true }).boundingBox()
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

test('plain-text preview links are safe and editing preserves the body', async ({ page }) => {
  const body = 'Links\nSee https://example.com/docs?q=1&x=2 and www.example.org.\n<script>alert(1)</script> javascript:alert(1)'
  await backend(page, { notes: [{ id: 'one', body, updatedAt: 1 }] })
  await page.goto('./')
  await expect(page.getByRole('textbox', { name: 'Note body' })).toHaveValue(body)
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(page.getByRole('link', { name: 'https://example.com/docs?q=1&x=2', exact: true })).toHaveAttribute('href', 'https://example.com/docs?q=1&x=2')
  await expect(page.getByRole('link', { name: 'www.example.org', exact: true })).toHaveAttribute('href', 'https://www.example.org')
  await expect(page.locator('.note-preview a')).toHaveCount(2)
  await expect(page.locator('.note-preview script')).toHaveCount(0)
  await page.getByRole('button', { name: 'Edit note', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Note body' })).toHaveValue(body)
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
  await expect(editor).toHaveValue('Keep this pending edit')
  await expect(page.getByRole('button', { name: 'New note', exact: true })).toBeVisible()
  const confirmation = page.waitForEvent('dialog')
  const signOut = page.getByRole('button', { name: 'Sign out', exact: true }).click()
  const dialog = await confirmation
  expect(dialog.message()).toContain('Changes are still syncing')
  await dialog.dismiss()
  await signOut
  await expect(editor).toHaveValue('Keep this pending edit')
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
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await expect(page.getByRole('status')).toHaveText('Saving')
  api.releaseWrites()
  await expect(page.getByRole('status')).toHaveText('Saved')
  await expect.poll(() => api.state().theme).toBe('dark')
})
