'use strict'

const qs = require('qs')
const { URL } = require('url')
const express = require('express')
const contentDisposition = require('content-disposition')
const createRenderer = require('./renderer')

const port = process.env.PORT || 3000

const app = express()

let renderer = null

// Configure.
app.set('query parser', s => qs.parse(s, { allowDots: true }))
app.disable('x-powered-by')

// Render url.
app.use(async (req, res, next) => {
  let { url, type, filename, ...options } = req.query

  if (!url) {
    return res.status(400).send('Search with url parameter. For eaxample, ?url=http://yourdomain')
  }

  if (!url.includes('://')) {
    url = `http://${url}`
  }

  try {
    switch (type) {
      case 'pdf':
        const urlObj = new URL(url)
        if (!filename) {
          filename = urlObj.hostname
          if (urlObj.pathname !== '/') {
            filename = urlObj.pathname.split('/').pop()
            if (filename === '') filename = urlObj.pathname.replace(/\//g, '')
            const extDotPosition = filename.lastIndexOf('.')
            if (extDotPosition > 0) filename = filename.substring(0, extDotPosition)
          }
        }
        if (!filename.toLowerCase().endsWith('.pdf')) {
          filename += '.pdf'
        }
        const { contentDispositionType, ...pdfOptions } = options
        const pdf = await renderer.pdf(url, pdfOptions)
        res
          .set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': contentDisposition(filename, {
              type: contentDispositionType || 'attachment',
            }),
          })
          .send(pdf)
        break

      case 'screenshot':
        const { screenshotType, buffer } = await renderer.screenshot(url, options)
        res
          .set({
            'Content-Type': `image/${screenshotType || 'png'}`,
            'Content-Length': buffer.length,
          })
          .send(buffer)
        break

      default:
        const html = await renderer.html(url, options)
        res.status(200).send(html)
    }
  } catch (e) {
    next(e)
  }
})

// Error page.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Oops, An expected error seems to have occurred.')
})

// Create renderer and start server.
createRenderer({
  ignoreHTTPSErrors: !!process.env.IGNORE_HTTPS_ERRORS,
})
  .then(createdRenderer => {
    renderer = createdRenderer
    console.info('Initialized renderer.')

    app.listen(port, () => {
      console.info(`Listen port on ${port}.`)
    })
  })
  .catch(e => {
    console.error('Fail to initialze renderer.', e)
  })

// Terminate process
process.on('SIGINT', () => {
  process.exit(0)
})
