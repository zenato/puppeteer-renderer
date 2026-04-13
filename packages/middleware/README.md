# puppeteer-renderer-middleware

An Express middleware for SSR using [puppeteer-renderer](http://github.com/zenato/puppeteer-renderer).


## Usage

```bash
$ pnpm install express puppeteer-renderer-middleware
```

```ts
import express from 'express'
import puppeteerRenderer from 'puppeteer-renderer-middleware'

const app = express();

// Use puppeteer-renderer middleware
app.use('/render', puppeteerRenderer({
  url: 'http://puppeteer-renderer:3030',
  // userAgentPattern: /My-Custom-Agent/i,
  // excludeUrlPattern: /\.html$/i,
  // timeout: 30 * 1000,
}));

// other codes..

app.listen(3000);
```

The middleware handles GET requests on the following routes:
- `/html` — Returns rendered HTML
- `/pdf` — Returns rendered PDF
- `/screenshot` — Returns rendered screenshot

## Configuration

| Property | Default | Description |
| -------- | ------- | ----------- |
| `url` | *Required* | puppeteer-renderer service URL to proxy requests to |
| `userAgentPattern` | Common bot user agents | Requests with matching user agent will skip rendering and pass through to `next()` |
| `excludeUrlPattern` | Common static file extensions | Requests with matching URL will skip rendering and pass through to `next()` |
| `timeout` | `10000` | Request timeout in milliseconds |
