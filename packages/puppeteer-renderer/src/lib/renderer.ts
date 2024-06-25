import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer'
import waitForAnimations from './wait-for-animations'
import {
  PageOptions,
  PageViewportOptions,
  PdfOptions,
  ScreenshotOptions,
} from './validate-schema'

export class Renderer {
  private browser: Browser

  constructor(browser: Browser) {
    this.browser = browser
  }

  async html(url: string, pageOptions: PageOptions) {
    let page: Page | undefined = undefined

    try {
      page = await this.createPage(url, pageOptions)
      const html = await page.content()
      return html
    } finally {
      await this.closePage(page)
    }
  }

  async pdf(url: string, pageOptions: PageOptions, pdfOptions: PdfOptions) {
    let page: Page | undefined = undefined

    try {
      page = await this.createPage(url, {
        ...pageOptions,
        emulateMediaType: pageOptions.emulateMediaType || 'print',
      })

      const buffer = await page.pdf(pdfOptions)
      return buffer
    } finally {
      await this.closePage(page)
    }
  }

  async screenshot(
    url: string,
    pageOptions: PageOptions,
    pageViewportOptions: PageViewportOptions,
    screenshotOptions: ScreenshotOptions
  ) {
    let page: Page | undefined = undefined

    try {
      page = await this.createPage(url, pageOptions)

      await page.setViewport(pageViewportOptions)

      const { animationTimeout, ...options } = screenshotOptions

      if (animationTimeout > 0) {
        await waitForAnimations(page, screenshotOptions, animationTimeout)
      }

      const buffer = await page.screenshot({
        ...options,
        quality: options.type === 'png' ? undefined : options.quality,
      })

      return {
        type: options.type,
        buffer,
      }
    } finally {
      await this.closePage(page)
    }
  }

  async createPage(url: string, pageOptions: PageOptions) {
    let page: Page | undefined = undefined

    try {
      page = await this.browser.newPage()

      page.on('error', error => {
        throw error
      })

      const { credentials, emulateMediaType, headers, ...options } = pageOptions

      headers && (await page.setExtraHTTPHeaders(JSON.parse(headers)))
      emulateMediaType && (await page.emulateMediaType(emulateMediaType))
      credentials && (await page.authenticate(credentials))

      await page.setCacheEnabled(false)
      await page.goto(url, options)

      return page
    } catch (e) {
      console.error(e)
      await this.closePage(page)
      throw e
    }
  }

  async closePage(page?: Page) {
    try {
      if (page && !page.isClosed()) {
        await page.close()
      }
    } catch (e) {
      // ignore
    }
  }

  async close() {
    await this.browser.close()
  }
}

export let renderer: Renderer | undefined = undefined

export default async function create(options: PuppeteerLaunchOptions = {}) {
  // Allows custom ars
  if (typeof options.args === 'undefined' || !(options.args instanceof Array)) {
    options.args = []
  }

  options.args.push('--no-sandbox')

  // disable cache
  options.args.push('--disable-dev-shm-usage')
  options.args.push('--disk-cache-size=0')
  options.args.push('--aggressive-cache-discard')

  const browser = await puppeteer.launch({
    ...options,
    headless: 'shell',
  })

  renderer = new Renderer(browser)

  console.info(`Initialized renderer.`, options)

  return renderer
}
