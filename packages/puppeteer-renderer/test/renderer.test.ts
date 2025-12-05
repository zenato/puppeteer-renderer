import fs from 'node:fs'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import createRenderer, { Renderer } from '../src/lib/renderer'

const resources = import.meta.dirname + '/resources'

let renderer: Renderer

beforeAll(async () => {
  renderer = await createRenderer()
})

afterAll(async () => {
  await renderer.close()
})

describe('Renderer', () => {
  it('should take rendered HTML code', async () => {
    const result = await renderer.html({ url: 'http://www.google.com' })
    expect(result.data).toBeTypeOf('string')
    expect(result.duration).toBeTypeOf('number')
  })

  it('should wait for animation to finish', async () => {
    const expected = PNG.sync.read(fs.readFileSync(`${resources}/X.png`))

    const result = await renderer.screenshot({
      url: `file://${resources}/ani.gif`,
      viewport: { width: expected.width, height: expected.height },
      type: 'png',
      animationTimeout: 4000,
    })
    const actual = PNG.sync.read(result.data.buffer)

    expect(result.data.type).toBe('png')
    expect(result.duration).toBeTypeOf('number')
    expect(
      pixelmatch(expected.data, actual.data, null, expected.width, expected.height),
    ).not.toBe(0)
  })

  it('should generate PDF', async () => {
    const result = await renderer.pdf({ url: 'http://www.google.com' })
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.duration).toBeTypeOf('number')
  })
})
