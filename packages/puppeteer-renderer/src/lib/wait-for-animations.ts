import { Page } from 'puppeteer'
import pixelmatch from 'pixelmatch'
import { PNG, PNGWithMetadata } from 'pngjs'
import type { ScreenshotOptions } from './types'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function waitForAnimations(
  page: Page,
  options: Omit<ScreenshotOptions, 'animationTimeout'>,
  timeout = 10000
) {
  const t0 = new Date().getTime()

  let previous: PNGWithMetadata | null = null

  while (new Date().getTime() - t0 < timeout) {
    const buffer = await page.screenshot({ ...options, type: 'png' })
    const current = PNG.sync.read(buffer as Buffer)

    if (previous !== null && previous.data.length === current.data.length) {
      const diff = pixelmatch(previous.data, current.data, null, previous.width, previous.height)
      if (diff === 0) {
        return true
      }
    }

    previous = current

    await sleep(100)
  }

  return false
}
