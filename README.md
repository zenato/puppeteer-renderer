# Puppeteer(Chrome headless node API) based web page renderer

[Puppeteer](https://github.com/GoogleChrome/puppeteer) (Chrome headless node API) based web page renderer.

Useful server side rendering through proxy. Outputs HTML, PDF and screenshots as PNG.

## Requirements
You can run Chromium or docker.

## Getting Started

### Start server using docker (If you can not run Chromium and installed docker)

```bash
docker run -d --name renderer -p 8080:3000 zenato/puppeteer-renderer
```

### Local (git clone)

`npm install`

#### Start server (If you can run Chromium)
`npm start`

(service port: 3000)

#### Locally build the image

```bash
docker build -t local/puppeteer-renderer .
docker run -d --name renderer -p 8080:3000 local/puppeteer-renderer
```

### Test on your browser
Input url `http://localhost:{port}/{html|pdf|screenshot}?url=https://www.google.com`

If you can see html code, server works fine.

### Puppeteer customization

When starting `npm start` or docker container you can customize puppeteer using environment variables.

- `IGNORE_HTTPS_ERRORS=true` - Ignores HTTPS errors
- `PUPPETEER_ARGS='--host-rules=MAP localhost yourproxy'` - Ads additional args that will be passed to puppeteer. Supports multiple arguments.

## Integration with existing service.

If you have active service, set proxy configuration with middleware.
See [puppeteer-renderer-middleware](middleware/README.md) for express.

```js
const renderer = require('puppeteer-renderer-middleware');

const app = express();

app.use(renderer({
  url: 'http://installed-your-puppeteer-renderer-url',
  // userAgentPattern: /My-Custom-Agent/i,
  // excludeUrlPattern: /*.html$/i
  // timeout: 30 * 1000,
}));

// your service logics..

app.listen(8080);
```

## API

Endpoint: `/{html|pdf|screenshot}`

| Name               | Required |          Value          | Description                                                                                                               | Usage                                                                                  |
| ------------------ | :------: | :---------------------: | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `url`              |   yes    |                         | Target URL                                                                                                                | `http://puppeteer-renderer/html?url=http://www.google.com`                             |
| `animationTimeout` |          | Timeout in milliseconds | Waits for animations to finish before taking the screenshot. Only applicable to `type` `screenshot`                       | `http://puppeteer-renderer/screenshot?url=http://www.google.com&animationTimeout=3000` |
| (Extra options)    |          |                         | Extra options (see [puppeteer API doc](https://github.com/GoogleChrome/puppeteer/blob/v1.1.0/docs/api.md#pagepdfoptions)) | `http://puppeteer-renderer/pdf?url=http://www.google.com&scale=2`                      |

## PDF File Name Convention

Generated PDFs are returned with a `Content-disposition` header requesting the browser to download the file instead of showing it.
The file name is generated from the URL rendered:

| URL                                            | Filename              |
| ---------------------------------------------- | --------------------- |
| `https://www.example.com/`                     | `www.example.com.pdf` |
| `https://www.example.com:80/`                  | `www.example.com.pdf` |
| `https://www.example.com/resource`             | `resource.pdf`        |
| `https://www.example.com/resource.extension`   | `resource.pdf`        |
| `https://www.example.com/path/`                | `path.pdf`            |
| `https://www.example.com/path/to/`             | `pathto.pdf`          |
| `https://www.example.com/path/to/resource`     | `resource.pdf`        |
| `https://www.example.com/path/to/resource.ext` | `resource.pdf`        |


## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Yeongjin Lee
