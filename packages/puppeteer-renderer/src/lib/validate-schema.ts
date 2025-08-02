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
  width: yup.number().required(),
  height: yup.number().required(),
  deviceScaleFactor: yup.number().default(1),
  isMobile: yup.boolean().default(false),
  hasTouch: yup.boolean().default(false),
  isLandscape: yup.boolean().default(false),
})

export type PageViewportOptions = yup.InferType<typeof pageViewportSchema>

export const screenshotSchema = yup.object({
  clip: yup.object({
    x: yup.number().required(),
    y: yup.number().required(),
    width: yup.number().required(),
    height: yup.number().required(),
  }).nullable(),
  encoding: yup.string().oneOf(['base64', 'binary']).default('binary'),
  fullPage: yup.boolean().default(false),
  omitBackground: yup.boolean().default(false),
  path: yup.string().nullable(),
  quality: yup.number().min(0).max(100).nullable(),
  type: yup.string().oneOf(['png', 'jpeg', 'webp']).default('png'),
})

export type ScreenshotOptions = yup.InferType<typeof screenshotSchema>

export const pdfSchema = yup.object({
  displayHeaderFooter: yup.boolean().default(true),
  footerTemplate: yup.string().default(''),
  format: yup.string().default('A4'),
  headerTemplate: yup.string().default(''),
  height: yup.string().nullable(),
  landscape: yup.boolean().default(false),
  margin: yup.object({
    top: yup.string().default(''),
    right: yup.string().default(''),
    bottom: yup.string().default(''),
    left: yup.string().default(''),
  }),
  pageRanges: yup.string().default(''),
  preferCSSPageSize: yup.boolean().default(false),
  printBackground: yup.boolean().default(false),
  scale: yup.number().default(1),
  width: yup.string().nullable(),
})

export type PdfOptions = yup.InferType<typeof pdfSchema>
