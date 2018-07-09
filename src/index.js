'use strict'

require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss.l' })
const express = require('express')
const { URL } = require('url')
const contentDisposition = require('content-disposition')
const createRenderer = require('./renderer')
const Auth = require('./auth')
const NodeCache = require("node-cache");
const myCache=new NodeCache({stdTTL:100, checkperiod:120});

const port = process.env.PORT || 3000
const disable_url = process.env.DISABLE_URL || false
const disable_auth = process.env.DISABLE_AUTH || false
const healthcheck_url = process.env.HEALTHCHECK_URL || false
const protocol_env = process.env.PROTOCOL || false
const base_host = process.env.SSM_NAMESPACE || false

let authentication = new Auth()
authentication.syncSecret()

const app = express()

let renderer = null

// Configure.
app.disable('x-powered-by')

// Render url.
app.use(async (req, res, next) => {
  let { url, uri, type, flag, token, ...options } = req.query
  if (req.url == '/healthcheck') {
    try {
      if (!healthcheck_url) {
        url = 'https://www.google.com'
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
  let url_protocol = req.protocol
  if(protocol_env){
	  url_protocol = protocol_env
  }
  if (disable_url && disable_url.toLowerCase() == 'true') {

    if (!uri) {
      return res.status(400).send('url disabled, please use uri')
    }
    if (!uri.startsWith("/analytics/ui/#/explore") && !uri.startsWith("/analytics/ui/#/dashboards") && !uri.startsWith("/analytics/ui/#/widgets")){
      return res.status(400).send('uri: '+ uri + ' is not allowed, use explore/dashboards')
    }
    
    if(!base_host) {
    	url = url_protocol + '://' + req.get('host') + uri
    } else {
    	url = url_protocol + '://' + base_host + '/' + uri
    }
    
    if(token){
    	if(url.indexOf('?') > -1) {
    	 url = url + "&token="+token
    	} else {
    	 url = url + "?token="+token	
    	}
    }
  } else if (!url) {
    url = url_protocol + '://' + req.get('host') + uri
  }

  console.log('Url:', url)

  if (!token) {
    var str = req.get('authorization')
    if (str) {
      var arr = str.trim().split(' ')
      token = arr[arr.length - 1]
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
        
        let pdf=null;
        //get latest page
        if(flag==0){
          pdf = await renderer.pdf(url, options)
        }else{//get page from cache
          let pdf_path=url+'_pdf';
          let pdfCache=myCache.get(pdf_path);
          if(pdfCache==undefined){
            pdf = await renderer.pdf(url, options)
            myCache.set(pdf_path,pdf,10000);
          }else{
            pdf=pdfCache;
          }     
        }
        res
          .set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': contentDisposition(filename + '.pdf'),
          })
          .send(pdf)
        
        break

      case 'screenshot':
        
        let image=null;
        // get latest page
        if(flag==0){
          image = await renderer.screenshot(url, options)                
        }else{  // get page from cache
          let image_path=url+'_image';
          let imageCache=myCache.get(image_path);       
          if(imageCache==undefined){
            image = await renderer.screenshot(url, options)
            myCache.set(image_path,image,10000);
          }else{
            image=imageCache;
          }      
        }
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
    console.log("3");
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
