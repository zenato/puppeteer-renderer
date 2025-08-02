import puppeteer from 'puppeteer'

import type { PageOptions, PDFOptions, ScreenshotOptions, Viewport } from './types'

class Renderer {
  private browser: puppeteer.Browser

  constructor(browser: puppeteer.Browser) {
    this.browser = browser
  }

  private async createPage(options: PageOptions) {
    const page = await this.browser.newPage()
    if (options.headers) {
      await page.setExtraHTTPHeaders(options.headers)
    }
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent)
    }
    if (options.viewport) {
      await page.setViewport(options.viewport)
    }
    return page
  }

  async html(url: string, options: PageOptions = {}) {
    const page = await this.createPage(options)
    await page.goto(url, {
      waitUntil: options.waitUntil || 'load',
      timeout: options.timeout || 30000
    })
    if (options.extraTimeout > 0) {
      await page.waitForTimeout(options.extraTimeout)
    }
    const html = await page.content()
    await page.close()
    return html
  }

  async screenshot(
    url: string,
    options: PageOptions = {},
    viewport: Viewport,
    screenshotOptions: ScreenshotOptions
  ) {
    const page = await this.createPage(options)
    if (viewport) {
      await page.setViewport(viewport)
    }
    await page.goto(url)
    const buffer = await page.screenshot(screenshotOptions)
    await page.close()
    return { type: screenshotOptions.type || 'png', buffer }
  }

  async pdf(url: string, options: PageOptions = {}, pdfOptions: PDFOptions) {
    const page = await this.createPage(options)
    await page.goto(url)
    const pdf = await page.pdf(pdfOptions)
    await page.close()
    return pdf
  }
}

export { Renderer }
