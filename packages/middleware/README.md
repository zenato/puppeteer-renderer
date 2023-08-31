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
  // excludeUrlPattern: /*.html$/i
  // timeout: 30 * 1000,
}));

// other codes..

app.listen(3030);
```

## Configuration

| Property | Default | Description |
| -------- | ------- | ----------- |
| `url` | *Required* | puppeteer-renderer public url |
| `userAgentPattern` | |Match user agent pattern |
| `excludeUrlPattern` | |Exclude url pattern |
| `timeout` | `10 * 1000` | Timeout ms |
