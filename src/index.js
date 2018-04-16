'use strict'

require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' })
const express = require('express')
const { URL } = require('url')
const contentDisposition = require('content-disposition')
const createRenderer = require('./renderer')
const Auth = require('./auth')

const port = process.env.PORT || 3000
const disable_url = process.env.DISABLE_URL || false
const disable_auth = process.env.DISABLE_AUTH || false
const healthcheck_url = process.env.HEALTHCHECK_URL || false
let authentication = new Auth()
authentication.syncSecret()

const app = express()

let renderer = null

// Configure.
app.disable('x-powered-by')

// Render url.
app.use(async (req, res, next) => {
  let { url, uri, type, token, ...options } = req.query
  if(req.url == '/healthcheck'){
	  try {
		  if(!healthcheck_url) {
			  url = "https://www.google.com"
		  } else {
			  url = healthcheck_url
		  }
		  console.info('Health check called, visiting url: ' + url)
		  const html = await renderer.render(url, options)
		  return res.status(200).send(html)
	  } catch (e) {
		  next(e)
	  }
  }

  if (!url && !uri) {
    return res
      .status(400)
      .send('Search with url or uri parameter. For eaxample, ?url=http://yourdomain, ?uri=/')
  }

  //  if (!url.includes('://')) {
  //    url = `http://${url}`
  //  }
  if (disable_url && disable_url.toLowerCase() == 'true') {
    if (!uri) {
      return res.status(400).send('url disabled, please use uri')
    }
    url = req.protocol + '://' + req.get('host') + uri
  } else if (!url) {
    url = req.protocol + '://' + req.get('host') + uri
  }

  console.log('Url:', url)

  if (!token) {
    var str = req.headers['authorization']
    if (str) {
      token = str.trim().split(' ')[1]
    }
  }

  if (!disable_auth || disable_auth.toLowerCase() !== 'true') {
	  authentication.authToken(token, res)
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

// Error page.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Oops, An unexpected error seems to have occurred: ' + err.message)
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
