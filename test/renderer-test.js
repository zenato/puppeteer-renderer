'use strict'

const { expect } = require('chai')
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const createRenderer = require('../src/renderer')

const resources = __dirname + '/resources'

let renderer = null

before(async function () {
  renderer = await createRenderer()
})

after(async function () {
  await renderer.close()
})

describe('Renderer', function () {
  this.timeout(10 * 1000)

  it('should take rendered HTML code', async function () {
    const html = await renderer.render('http://www.google.com')
    expect(html).to.be.a('string')
  })

  it('should wait for animation to finish', async function () {
    const expected = PNG.sync.read(fs.readFileSync(`${resources}/X.png`))

    const screenshot = await renderer.screenshot(`file://${resources}/ani.gif`, {
      screenshotType: 'png',
      width: expected.width,
      height: expected.height,
      animationTimeout: 5000
    })
    const actual = PNG.sync.read(screenshot.buffer)

    expect(pixelmatch(expected.data, actual.data, null, expected.width, expected.height)).to.equal(0)
  })
})
