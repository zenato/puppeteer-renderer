'use strict'

const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch')

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForAnimations(page, options, timeout = 10000) {
  const t0 = new Date().getTime()

  let previous = null
  while (new Date().getTime() - t0 < timeout) {
    const current = PNG.sync.read(await page.screenshot({ ...options, type: 'png' }))

    if (previous !== null && (previous.data.length === current.data.length)) {
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

module.exports = waitForAnimations
