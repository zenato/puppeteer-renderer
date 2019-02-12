'use strict'

const express = require('express')
const { URL } = require('url')
const contentDisposition = require('content-disposition')
const createRenderer = require('./renderer')

const port = process.env.PORT || 3000

const app = express()

let renderer = null

// Configure.
app.disable('x-powered-by')

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Render url.
app.get('/', async (req, res) => {
  let { url, type, ...options } = req.query

  if (!url) {
    return res.status(400).send('Search with url parameter. For example, ?url=http://yourdomain')
  }

  if (!url.includes('://')) {
    url = `http://${url}`
  }

  try {
    switch (type) {
      case 'pdf':
        const urlObj = new URL(url)
        let filename = urlObj.hostname
        if (urlObj.pathname !== '/') {
          filename = urlObj.pathname.split('/').pop()
          if (filename === '') filename = urlObj.pathname.replace(/\//g, '')
          const extDotPosition = filename.lastIndexOf('.')
          if (extDotPosition > 0) filename = filename.substring(0, extDotPosition)
        }
        const pdf = await renderer.pdf(url, options)
        res
          .set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': contentDisposition(filename + '.pdf'),
          })
          .send(pdf)
        break

      case 'screenshot':
        const image = await renderer.screenshot(url, options)
        res
          .set({
            'Content-Type': 'image/png',
            'Content-Length': image.length,
          })
          .send(image)
        break

      default:
        const html = await renderer.render(url, options)
        res.status(200).send(html)
    }
  } catch (e) {
    next(e)
  }
})

// Render HTML.
// POST form data: [html]=HTML data, [filename]=filename without extension (only for type='pdf')
app.post('/', async (req, res) => {
  let { type, ...options } = req.query
  const html = req.body.html
  const filename = req.body.filename

  if (!html) {
    return res.status(400).send('Missing form field "html".')
  }

  if (!filename) {
    return res.status(400).send('Missing form field "filename".')
  }

  try {
    switch (type) {
      default:
      case 'pdf':
        const pdf = await renderer.pdfFromHtml(html, options)
        res
          .set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': contentDisposition(filename + '.pdf'),
          })
          .send(pdf)
        break

      case 'screenshot':
        const image = await renderer.screenshot(url, options)
        res
          .set({
            'Content-Type': 'image/png',
            'Content-Length': image.length,
          })
          .send(image)
        break
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
createRenderer()
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
