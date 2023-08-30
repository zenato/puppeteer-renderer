import qs from 'qs'
import express, { NextFunction, Request, Response } from 'express'
import createRenderer from './lib/renderer'
import router from './router'

const port = process.env.PORT || 3000

const app = express()

// Configure.
app.disable('x-powered-by')
app.set('query parser', (s: any) => qs.parse(s, { allowDots: true }))

// Render url.
app.use(router)

// Index
app.get('/', (req: Request, res: Response) => {
  res.status(200).send(`You can use <a href="/html">/html</a>, <a href="/screenshot">/screenshot</a> or <a href="/pdf">/pdf</a> endpoint.`)
})

// Not found page.
app.use((req: Request, res: Response) => {
  res.status(404).send('Not found.')
})

// Error page.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).send('Oops, An expected error seems to have occurred.')
})

// Create renderer and start server.
createRenderer({
  //devtools:true,

  ignoreHTTPSErrors: !!process.env.IGNORE_HTTPS_ERRORS,

  // We want to support multiple args in a string, to support spaces we will use -- as the separator
  // and rebuild the array with valid values:
  // '--host-rules=MAP localhost yourproxy --test' -> ['', 'host-rules=MAP localhost yourproxy', '', 'test'] -> ['--host-rules=MAP localhost yourproxy', '--test']
  args:
    typeof process.env.PUPPETEER_ARGS === 'string'
      ? process.env.PUPPETEER_ARGS.split('--')
          .filter(value => value !== '')
          .map(function (value) {
            return '--' + value
          })
      : [],
})
  .then(() => {
    app.listen(port, () => {
      console.info(`Listen port on ${port}.`)
    })
  })
  .catch(e => {
    console.error('Fail to initialize renderer.', e)
  })

// Terminate process
process.on('SIGINT', () => {
  process.exit(0)
})
