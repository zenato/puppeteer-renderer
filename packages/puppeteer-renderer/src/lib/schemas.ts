import { z } from 'zod'
import type { HtmlOptions, ScreenshotOptions, PdfOptions } from './types'

// URL 검증 및 변환
const urlSchema = z
  .string({ required_error: 'URL is required' })
  .min(1, 'URL is required')
  .transform((value) => {
    // 프로토콜이 없을 때만 https:// 추가
    if (value && !/^https?:\/\//.test(value)) {
      return `https://${value}`
    }
    return value
  })
  .refine(
    (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid URL format' },
  )

// Credentials 스키마
const credentialsSchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .optional()

// Headers 스키마 (객체 또는 JSON 문자열 하위 호환)
const headersSchema = z
  .union([z.string(), z.record(z.string())])
  .optional()
  .transform((value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Record<string, string>
      } catch {
        throw new Error('Invalid JSON format for headers')
      }
    }
    return value
  })

// Cookie 스키마
const cookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  domain: z.string().optional(),
  path: z.string().optional(),
  expires: z.number().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
})

// Viewport 스키마
const viewportSchema = z
  .object({
    width: z.coerce.number().positive().int().default(800),
    height: z.coerce.number().positive().int().default(600),
    deviceScaleFactor: z.coerce.number().positive().optional(),
    isMobile: z.coerce.boolean().optional(),
    hasTouch: z.coerce.boolean().optional(),
    isLandscape: z.coerce.boolean().optional(),
  })
  .optional()

// 공통 옵션 스키마
const commonSchemaBase = z.object({
  url: urlSchema,
  timeout: z.coerce.number().positive().int().default(30000),
  waitUntil: z.any().default('networkidle2'),
  credentials: credentialsSchema,
  headers: headersSchema,
  cookies: z.array(cookieSchema).optional(),
  userAgent: z.string().optional(),
  viewport: viewportSchema,
  device: z.string().optional(),
  emulateMediaType: z.enum(['screen', 'print']).optional(),
  waitForSelector: z.string().optional(),
  waitForSelectorTimeout: z.coerce.number().positive().int().default(30000),
  disableCache: z.coerce.boolean().default(true),
})

export const commonSchema = commonSchemaBase

// HTML 스키마
export const htmlSchema = commonSchemaBase

// Clip 스키마
const clipSchema = z
  .object({
    x: z.coerce.number(),
    y: z.coerce.number(),
    width: z.coerce.number().positive(),
    height: z.coerce.number().positive(),
  })
  .optional()

// 스크린샷 스키마
export const screenshotSchema = commonSchemaBase.extend({
  type: z.enum(['png', 'jpeg', 'webp']).default('png'),
  quality: z.coerce.number().min(0).max(100).optional(),
  fullPage: z.coerce.boolean().optional(),
  clip: clipSchema,
  omitBackground: z.coerce.boolean().optional(),
  encoding: z.enum(['binary', 'base64']).optional(),
  animationTimeout: z.coerce.number().min(0).default(0),
})

// PDF Margin 스키마
const marginSchema = z
  .object({
    top: z.string().optional(),
    right: z.string().optional(),
    bottom: z.string().optional(),
    left: z.string().optional(),
  })
  .optional()

// PDF 스키마
export const pdfSchema = commonSchemaBase.extend({
  filename: z.string().optional(),
  contentDisposition: z.enum(['attachment', 'inline']).default('attachment'),
  scale: z.coerce.number().min(0.1).max(2).default(1.0),
  displayHeaderFooter: z.coerce.boolean().optional(),
  headerTemplate: z.string().optional(),
  footerTemplate: z.string().optional(),
  printBackground: z.coerce.boolean().optional(),
  landscape: z.coerce.boolean().optional(),
  pageRanges: z.string().optional(),
  format: z.string().optional(),
  paperWidth: z.string().optional(),
  paperHeight: z.string().optional(),
  margin: marginSchema,
  preferCSSPageSize: z.coerce.boolean().optional(),
})

// 타입 추론 (Zod에서 자동 생성)
export type CommonOptionsSchema = z.infer<typeof commonSchema>
export type HtmlOptionsSchema = z.infer<typeof htmlSchema>
export type ScreenshotOptionsSchema = z.infer<typeof screenshotSchema>
export type PdfOptionsSchema = z.infer<typeof pdfSchema>

// 파싱 함수
export function parseHtmlOptions(data: unknown): HtmlOptions {
  return htmlSchema.parse(data) as HtmlOptions
}

export function parseScreenshotOptions(data: unknown): ScreenshotOptions {
  return screenshotSchema.parse(data) as ScreenshotOptions
}

export function parsePdfOptions(data: unknown): PdfOptions {
  return pdfSchema.parse(data) as PdfOptions
}
