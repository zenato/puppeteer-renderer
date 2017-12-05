'use strict'

const { expect } = require('chai')
const createRenderer = require('../src/renderer')

let renderer = null

before(async function() {
  renderer = await createRenderer()
})

after(async function() {
  await renderer.close()
})

describe('Renderer', function() {
  this.timeout(10 * 1000)

  it('should take rendered HTML code', async function() {
    const html = await renderer.render('http://www.google.com')
    expect(html).to.be.a('string')
  })
})
