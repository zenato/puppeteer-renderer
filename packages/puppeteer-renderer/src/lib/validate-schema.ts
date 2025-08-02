import { PaperFormat, PuppeteerLifeCycleEvent } from 'puppeteer'
import * as yup from 'yup'

export const pageSchema = yup.object({
  headers: yup.object().nullable(),
  userAgent: yup.string().nullable(),
  viewport: yup.object({
    width: yup.number().required(),
    height: yup.number().required(),
    deviceScaleFactor: yup.number().default(1),
    isMobile: yup.boolean().default(false),
    hasTouch: yup.boolean().default(false),
    isLandscape: yup.boolean().default(false),
  }).nullable(),
  waitUntil: yup.string().oneOf(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).default('load'),
  timeout: yup.number().integer().min(0).default(30000),
  extraTimeout: yup.number().integer().min(0).default(0),
})

export type PageOptions = yup.InferType<typeof pageSchema>

export const pageViewportSchema = yup.object({
  width: yup.number().default(800),
  height: yup.number().default(600),
})

export type PageViewportOptions = yup.InferType<typeof pageViewportSchema>

export const screenshotSchema = yup.object({
  type: yup.string<'png' | 'jpeg' | 'webp'>().default('png'),
  path: yup.string(),
  quality: yup.number().default(0),
  fullPage: yup.boolean(),
  clip: yup
    .object({
      x: yup.number().required(),
      y: yup.number().required(),
      width: yup.number().required(),
      height: yup.number().required(),
    })
    .default(undefined),
  omitBackground: yup.boolean(),
  encoding: yup.string<'binary' | 'base64'>(),

  // Extra options
  animationTimeout: yup.number().default(0),
})

export type ScreenshotOptions = yup.InferType<typeof screenshotSchema>

export const pdfSchema = yup.object({
  path: yup.string(),
  scale: yup.number().default(1.0),
  displayHeaderFooter: yup.boolean(),
  headerTemplate: yup.string(),
  footerTemplate: yup.string(),
  printBackground: yup.boolean(),
  landscape: yup.boolean(),
  pageRanges: yup.string(),
  format: yup.string<PaperFormat>(),
  width: yup.string(),
  height: yup.string(),
  margin: yup.object({
    top: yup.string(),
    right: yup.string(),
    bottom: yup.string(),
    left: yup.string(),
  }),
  preferCSSPageSize: yup.boolean(),
})

export type PdfOptions = yup.InferType<typeof pdfSchema>
