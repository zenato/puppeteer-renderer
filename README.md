[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/zenato/puppeteer-renderer)

# Puppeteer(Chrome headless node API) based web page renderer

Puppeteer(Chrome headless node API) based web page renderer.

Useful server side rendering through proxy.


## Requirements
You can run Chromium or docker.


## Getting Started

### Install dependencies.
`npm install`

### Start server (If you can run Chromium)
`npm start`

(service port: 3000)

### Start server using docker (If you can not run Chromium and installed docker)
`docker run -d --name renderer -p 8080:3000 zenato/puppeteer-renderer`

### Test on your browser
Input url `http://localhost:{port}/?url=https://www.google.com`

If you can see html code, server works fine.

## Integration with existing service.

If you have active service, set proxy configuration with middleware.
See [puppeteer-renderer-middleware](middleware/README.md) for express.

```js
const renderer = require('puppeteer-renderer-middleware');

const app = express();

app.use(renderer({
  url: 'http://installed-your-puppeterr-renderer-url',
  // userAgentPattern: /My-Custom-Agent/i,
  // excludeUrlPattern: /*.html$/i
  // timeout: 30 * 1000,
}));

// your service logics..

app.listen(8080);
```

## API

| Name  | Required | Value   | Description            |Usage                                                   |
|-------|:--------:|:-------:|------------------------|--------------------------------------------------------|
|url    |O         |         |Target URL              |http://puppeterr-renderer?url=http://www.google.com         |
|type   |          |(pdf\|screenshot)    |Rendering another type. |http://puppeterr-renderer?url=http://www.google.com&type=pdf|

