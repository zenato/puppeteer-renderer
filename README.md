# Puppeteer Renderer

[Puppeteer](https://github.com/puppeteer/puppeteer) (Chrome headless) based web page renderer.

Renders web pages to HTML, PDF, or screenshots (PNG/JPEG/WebP). Supports both GET and POST requests.

## Requirements

- Node.js >= 24
- Chromium or Docker

## Getting Started

### Docker

```bash
docker run -d --name renderer -p 8080:3000 ghcr.io/zenato/puppeteer-renderer:latest
```

### Local Development

```bash
pnpm install
pnpm dev
```

Server runs on port 3000 by default.

### Build Docker Image Locally

```bash
docker build . --file ./Dockerfile --tag local/puppeteer-renderer --build-arg SCOPE=puppeteer-renderer
docker run -d --name renderer -p 8080:3000 local/puppeteer-renderer
```

## API Endpoints

### Rendering Endpoints

These endpoints support both `GET` (query parameters) and `POST` (JSON body).

| Endpoint | Description |
|----------|-------------|
| `GET/POST /html` | Renders page and returns HTML |
| `GET/POST /screenshot` | Captures page screenshot |
| `GET/POST /pdf` | Generates PDF from page |

### Utility Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check. Returns `{ "status": "ok" }` |

## Rendering Options

The following options apply to `/html`, `/screenshot`, and `/pdf` endpoints.

**Note:** For complex options like `headers`, `cookies`, and nested objects, use POST with JSON body. GET requests support dot notation for simple nested values (e.g., `viewport.width=1920`).

### Common Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | **required** | Target URL |
| `timeout` | number | 30000 | Navigation timeout (ms) |
| `waitUntil` | string | 'networkidle2' | When to consider navigation done |
| `viewport.width` | number | 800 | Viewport width |
| `viewport.height` | number | 600 | Viewport height |
| `device` | string | - | Device emulation (e.g., 'iPhone 14 Pro') |
| `userAgent` | string | - | Custom user agent |
| `headers` | object | - | Custom HTTP headers |
| `cookies` | array | - | Cookies to set |
| `credentials.username` | string | - | HTTP basic auth username |
| `credentials.password` | string | - | HTTP basic auth password |
| `emulateMediaType` | string | - | 'screen' or 'print' |
| `waitForSelector` | string | - | Wait for element before capture |
| `waitForSelectorTimeout` | number | 30000 | Selector wait timeout (ms) |
| `disableCache` | boolean | true | Disable page cache |

## Screenshot Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | 'png' | 'png', 'jpeg', or 'webp' |
| `quality` | number | - | Quality (0-100, jpeg/webp only) |
| `fullPage` | boolean | false | Capture full page |
| `clip` | object | - | Clip region `{ x, y, width, height }` |
| `omitBackground` | boolean | false | Transparent background |
| `encoding` | string | 'binary' | 'binary' or 'base64' |
| `animationTimeout` | number | 0 | Wait for animations (ms) |

## PDF Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filename` | string | - | Custom filename |
| `contentDisposition` | string | 'attachment' | 'attachment' or 'inline' |
| `scale` | number | 1.0 | Scale (0.1 - 2.0) |
| `format` | string | - | Paper format (A4, Letter, etc.) |
| `landscape` | boolean | false | Landscape orientation |
| `printBackground` | boolean | false | Print background graphics |
| `margin` | object | - | Margins `{ top, right, bottom, left }` |
| `displayHeaderFooter` | boolean | false | Show header/footer |
| `headerTemplate` | string | - | Header HTML template |
| `footerTemplate` | string | - | Footer HTML template |

## Usage Examples

### GET Request

```bash
# HTML
curl "http://localhost:3000/html?url=https://example.com"

# Screenshot with viewport
curl "http://localhost:3000/screenshot?url=https://example.com&viewport.width=1920&viewport.height=1080"

# PDF
curl "http://localhost:3000/pdf?url=https://example.com&filename=report.pdf" -o report.pdf
```

### POST Request

```bash
# Screenshot with device emulation
curl -X POST http://localhost:3000/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "device": "iPhone 14 Pro",
    "fullPage": true,
    "type": "webp",
    "quality": 90
  }' -o screenshot.webp

# PDF with custom headers and cookies
curl -X POST http://localhost:3000/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/dashboard",
    "headers": { "Authorization": "Bearer token123" },
    "cookies": [{ "name": "session", "value": "abc", "domain": "example.com" }],
    "printBackground": true,
    "format": "A4"
  }' -o dashboard.pdf

# Wait for specific element
curl -X POST http://localhost:3000/screenshot \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "waitForSelector": "#main-content",
    "waitForSelectorTimeout": 10000
  }' -o screenshot.png
```

## Error Response

All errors return JSON:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "URL is required"
  }
}
```

Error codes: `VALIDATION_ERROR`, `NAVIGATION_ERROR`, `TIMEOUT_ERROR`, `SELECTOR_NOT_FOUND`, `BROWSER_ERROR`, `INTERNAL_ERROR`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `IGNORE_HTTPS_ERRORS` | Set to 'true' to ignore SSL errors |
| `PUPPETEER_ARGS` | Additional Chromium arguments (separated by `--`) |

## Integration with Express

See [puppeteer-renderer-middleware](packages/middleware/README.md) for integrating with existing Express apps.

```ts
import express from 'express'
import renderer from 'puppeteer-renderer-middleware'

const app = express()

app.use('/render-proxy', renderer({
  url: 'http://localhost:3000',
}))

app.listen(8080)
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Yeongjin Lee
