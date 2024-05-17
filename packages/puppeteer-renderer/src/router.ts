import * as yup from 'yup'
import express from 'express'
import { renderer } from './lib/renderer'
import { pageSchema, pageViewportSchema, pdfSchema, screenshotSchema } from './lib/validate-schema'
import contentDisposition from 'content-disposition'

const router = express.Router()

const urlSchema = yup.object({ url: yup.string().required() }).transform(current => {
  const regex = /^https?:\/\//;
  if (!regex.test(current.url)) {
    current.url = `https://${current.url}`
  }
  return current;
})

router.get('/html', async (req, res, next) => {
  try {
    const { url, ...pageOptions } = urlSchema.concat(pageSchema).validateSync(req.query)
    const html = await renderer!.html(url, pageOptions)
    res.status(200).send(html)
  } catch (e) {
    next(e)
  }
})

router.get('/screenshot', async (req, res, next) => {
  try {
    const { url, ...pageOptions } = urlSchema.concat(pageSchema).validateSync(req.query)
    const pageViewportOptions = pageViewportSchema.validateSync(req.query)
    const screenshotOptions = screenshotSchema.validateSync(req.query)

    const { type, buffer } = await renderer!.screenshot(
      url,
      pageOptions,
      pageViewportOptions,
      screenshotOptions
    )
    res
      .set({
        'Content-Type': `image/${type || 'png'}`,
        'Content-Length': buffer.length,
      })
      .send(buffer)
  } catch (e) {
    next(e)
  }
})

router.get('/pdf', async (req, res, next) => {
  try {
    const { url, filename, contentDispositionType, ...pageOptions } = urlSchema
      .concat(
        yup.object({ filename: yup.string().nullable(), contentDispositionType: yup.string() })
      )
      .concat(pageSchema)
      .validateSync(req.query)
    const pdfOptions = pdfSchema.validateSync(req.query)

    const pdf = await renderer!.pdf(url, pageOptions, pdfOptions)

    res
      .set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdf.length,
        'Content-Disposition': contentDisposition(filename || getPDFFilename(url), {
          type: contentDispositionType || 'attachment',
        }),
      })
      .send(pdf)
  } catch (e) {
    next(e)
  }
})

function getPDFFilename(url: string) {
  const urlObj = new URL(url)

  let filename = urlObj.hostname

  if (urlObj.pathname !== '/') {
    // Get last part of path
    filename = urlObj.pathname.split('/').pop() || ''

    // Cut off extension
    const extDotPosition = filename.lastIndexOf('.')
    if (extDotPosition > 0) {
      filename = filename.substring(0, extDotPosition)
    }
  }

  // Add .pdf extension
  if (!filename.toLowerCase().endsWith('.pdf')) {
    filename += '.pdf'
  }

  return filename
}

export default router
