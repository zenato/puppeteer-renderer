import express, { Request, Response, NextFunction } from 'express'
import contentDisposition from 'content-disposition'
import { renderer } from './lib/renderer'
import { parseHtmlOptions, parseScreenshotOptions, parsePdfOptions } from './lib/schemas'
import { Errors } from './lib/errors'

const router = express.Router()

/**
 * GET/POST 파라미터 병합 헬퍼
 */
function getParams(req: Request): Record<string, unknown> {
  return {
    ...(req.body || {}),
    ...req.query,
  }
}

/**
 * PDF 파일명 생성 헬퍼
 */
function getPdfFilename(url: string): string {
  try {
    const urlObj = new URL(url)
    let filename = urlObj.hostname

    if (urlObj.pathname !== '/') {
      const pathPart = urlObj.pathname.split('/').pop() || ''
      const extDot = pathPart.lastIndexOf('.')
      filename = extDot > 0 ? pathPart.substring(0, extDot) : pathPart
    }

    return filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  } catch {
    return 'document.pdf'
  }
}

/**
 * HTML 렌더링
 * GET  /html?url=...
 * POST /html { url: "..." }
 */
async function htmlHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getParams(req)
    const options = parseHtmlOptions(params)

    if (!renderer) {
      throw Errors.browser('Renderer not initialized')
    }

    const result = await renderer.html(options)

    // Accept 헤더에 따라 JSON 또는 HTML 반환
    if (req.accepts('json') && !req.accepts('html')) {
      res.json({
        success: true,
        data: result.data,
        meta: {
          duration: result.duration,
          url: options.url,
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      res.set('X-Render-Duration', String(result.duration))
      res.status(200).send(result.data)
    }
  } catch (e) {
    next(e)
  }
}

router.get('/html', htmlHandler)
router.post('/html', htmlHandler)

/**
 * 스크린샷 생성
 * GET  /screenshot?url=...&viewport.width=800&viewport.height=600
 * POST /screenshot { url: "...", viewport: { width: 800, height: 600 } }
 */
async function screenshotHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getParams(req)
    const options = parseScreenshotOptions(params)

    if (!renderer) {
      throw Errors.browser('Renderer not initialized')
    }

    const result = await renderer.screenshot(options)

    // base64 인코딩 요청 시 JSON 응답
    if (options.encoding === 'base64' || (req.accepts('json') && !req.accepts('image/*'))) {
      res.json({
        success: true,
        data: {
          type: result.data.type,
          encoding: 'base64',
          data: result.data.buffer.toString('base64'),
        },
        meta: {
          duration: result.duration,
          url: options.url,
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      res
        .set({
          'Content-Type': `image/${result.data.type}`,
          'Content-Length': String(result.data.buffer.length),
          'X-Render-Duration': String(result.duration),
        })
        .send(result.data.buffer)
    }
  } catch (e) {
    next(e)
  }
}

router.get('/screenshot', screenshotHandler)
router.post('/screenshot', screenshotHandler)

/**
 * PDF 생성
 * GET  /pdf?url=...
 * POST /pdf { url: "...", filename: "report.pdf" }
 */
async function pdfHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getParams(req)
    const options = parsePdfOptions(params)

    if (!renderer) {
      throw Errors.browser('Renderer not initialized')
    }

    const result = await renderer.pdf(options)
    const filename = options.filename || getPdfFilename(options.url)

    // base64 요청 시 JSON 응답
    if (req.accepts('json') && !req.accepts('application/pdf')) {
      res.json({
        success: true,
        data: {
          encoding: 'base64',
          data: result.data.toString('base64'),
        },
        meta: {
          duration: result.duration,
          url: options.url,
          filename,
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      res
        .set({
          'Content-Type': 'application/pdf',
          'Content-Length': String(result.data.length),
          'Content-Disposition': contentDisposition(filename, {
            type: options.contentDisposition || 'attachment',
          }),
          'X-Render-Duration': String(result.duration),
        })
        .send(result.data)
    }
  } catch (e) {
    next(e)
  }
}

router.get('/pdf', pdfHandler)
router.post('/pdf', pdfHandler)

export default router
