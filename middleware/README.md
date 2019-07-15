# puppeteer-renderer-middleware

An Express middleware for SSR using [puppeteer-renderer](http://github.com/zenato/puppeteer-renderer).


## Usage

```bash
$ npm install --save express puppeteer-renderer-middleware
```

```js
const express = require('express');
const puppeteerRenderer = require('puppeteer-renderer-middleware');

const app = express();

app.use(puppeteerRenderer({
  url: 'http://puppeteer-renderer/render',
  // userAgentPattern: /My-Custom-Agent/i,
  // excludeUrlPattern: /*.html$/i
  // timeout: 30 * 1000,
}));

// other codes..

app.listen(8080);
```

## Configuration

| Property | Default | Description |
| -------- | ------- | ----------- |
| `url` | *Required* | puppeteer-renderer public url |
| `userAgentPattern` | |Match user agent pattern |
| `excludeUrlPattern` | |Exclude url pattern |
| `timeout` | `10 * 1000` | Timeout ms |
