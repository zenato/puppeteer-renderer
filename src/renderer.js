'use strict'

const _ = require('lodash')
const yup = require('yup')
const puppeteer = require('puppeteer')

const waitForAnimations = require('./wait-for-animations')

const pageSchema = yup.object({
  timeout: yup.number().default(30 * 1000),
  waitUntil: yup.string().default('networkidle2'),
  credentials: yup.string(),
  emulateMediaType: yup.string(),
})

const pdfSchema = yup.object({
  path: yup.string(),
  scale: yup.number().default(1.0),
  displayHeaderFooter: yup.boolean(),
  headerTemplate: yup.string(),
  footerTemplate: yup.string(),
  printBackground: yup.boolean(),
  landscape: yup.boolean(),
  pageRanges: yup.string(),
  format: yup.string(),
  width: yup.string(),
  height: yup.string(),
  margin: yup.object({
    top: yup.string(),
    right: yup.string(),
    bottom: yup.string(),
    left: yup.string(),
  }),
  preferCSSPageSize: yup.boolean(),
})

const screenshotSchema = yup.object({
  screenshotType: yup.string().default('png'), // instead of `type` property
  path: yup.string(),
  quality: yup.number().default(0),
  fullPage: yup.boolean(),
  clip: yup
    .object({
      x: yup.number(),
      y: yup.number(),
      width: yup.number(),
      height: yup.number(),
    })
    .default(undefined),
  omitBackground: yup.boolean(),
  encoding: yup.string(),

  // Extra options
  width: yup.number().default(800),
  height: yup.number().default(600),
  animationTimeout: yup.number().default(0),
})

class Renderer {
  constructor(browser) {
    this.browser = browser
  }

  async html(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, credentials } = options
      page = await this.createPage(url, { timeout, waitUntil, credentials })
      const html = await page.content()
      return html
    } finally {
      this.closePage(page)
    }
  }

  async pdf(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, credentials, emulateMediaType, ...extraOptions } = options
      page = await this.createPage(url, {
        timeout,
        waitUntil,
        credentials,
        emulateMediaType: emulateMediaType || 'print',
      })

      const pdfOptions = await pdfSchema.validate(extraOptions)
      const buffer = await page.pdf(pdfOptions)
      return buffer
    } finally {
      this.closePage(page)
    }
  }

  async screenshot(url, options = {}) {
    let page = null
    try {
      const { timeout, waitUntil, credentials, ...restOptions } = options
      const {
        width,
        height,
        animationTimeout,
        ...validatedOptions
      } = await screenshotSchema.validate(restOptions)
      const screenshotOptions = {
        ..._.omit(validatedOptions, ['screenshotType']),
        type: validatedOptions.screenshotType,
        quality: validatedOptions.screenshotType === 'png' ? 0 : validatedOptions.quality,
      }

      page = await this.createPage(url, { timeout, waitUntil, credentials })
      await page.setViewport({ width, height })

      if (animationTimeout > 0) {
        await waitForAnimations(page, screenshotOptions, animationTimeout)
      }

      const buffer = await page.screenshot(screenshotOptions)
      return {
        screenshotType: screenshotOptions.type,
        buffer,
      }
    } finally {
      this.closePage(page)
    }
  }

  async createPage(url, options = {}) {
    const { timeout, waitUntil, credentials, emulateMediaType } = await pageSchema.validate(options)
    const page = await this.browser.newPage()

    await page.setCacheEnabled(false)

    page.on('error', async error => {
      console.error(error)
      await this.closePage(page)
    })

    if (emulateMediaType) {
      await page.emulateMediaType(emulateMediaType)
    }

    if (credentials) {
      await page.authenticate(credentials)
    }

    await page.goto(url, { timeout, waitUntil })
    return page
  }

  async closePage(page) {
    try {
      if (page && !page.isClosed()) {
        await page.close()
      }
    } catch (e) {}
  }

  async close() {
    await this.browser.close()
  }
}

async function create(options = {}) {
  const browser = await puppeteer.launch(Object.assign({ args: ['--no-sandbox'] }, options))
  return new Renderer(browser)
}

module.exports = create
