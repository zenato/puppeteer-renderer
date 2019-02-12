'use strict'

const puppeteer = require('puppeteer')

class Renderer {
  constructor(browser) {
    this.browser = browser
  }

  async createPage(url, options = {}) {
    const { timeout, waitUntil } = options
    const page = await this.browser.newPage()
    await page.goto(url, {
      timeout: Number(timeout) || 30 * 1000,
      waitUntil: waitUntil || 'networkidle2',
    })
    return page
  }

  async createPageFromHtml(html) {
    const page = await this.browser.newPage()
    await page.setContent(html)
    return page
  }

  async render(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil } = options
      page = await this.createPage(url, { timeout, waitUntil })
      const html = await page.content()
      return html
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async pdf(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, ...extraOptions } = options
      page = await this.createPage(url, { timeout, waitUntil })
      return await this.pageBuffer(page, extraOptions)
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async pdfFromHtml(html, options = {}) {
    let page = null
    try {
      page = await this.createPageFromHtml(html)
      return await this.pageBuffer(page, options)
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async pageBuffer(page, options) {
    const { scale, displayHeaderFooter, printBackground, landscape } = options

    return await page.pdf({
      ...options,
      scale: Number(scale),
      displayHeaderFooter: displayHeaderFooter === 'true',
      printBackground: printBackground === 'true',
      landscape: landscape === 'true',
    })
  }

  async screenshot(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, ...extraOptions } = options
      page = await this.createPage(url, { timeout, waitUntil })
      page.setViewport({
        width: Number(extraOptions.width || 800),
        height: Number(extraOptions.height || 600),
      })

      const { fullPage, omitBackground, imageType, quality } = extraOptions
      const buffer = await page.screenshot({
        ...extraOptions,
        type: imageType || 'png',
        quality: Number(quality) || (imageType === undefined || imageType == 'png' ? 0 : 100),
        fullPage: fullPage === 'true',
        omitBackground: omitBackground === 'true',
      })
      return buffer
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async close() {
    await this.browser.close()
  }
}

async function create() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  return new Renderer(browser)
}

module.exports = create
