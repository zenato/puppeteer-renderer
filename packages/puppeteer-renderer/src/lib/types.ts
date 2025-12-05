import type { PuppeteerLifeCycleEvent, PaperFormat } from 'puppeteer'

/**
 * 쿠키 정의
 */
export interface Cookie {
  name: string
  value: string
  domain?: string
  path?: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/**
 * 인증 정보
 */
export interface Credentials {
  username: string
  password: string
}

/**
 * Viewport 설정
 */
export interface ViewportOptions {
  width: number
  height: number
  deviceScaleFactor?: number
  isMobile?: boolean
  hasTouch?: boolean
  isLandscape?: boolean
}

/**
 * 모든 엔드포인트 공통 옵션
 */
export interface CommonOptions {
  url: string
  timeout?: number
  waitUntil?: PuppeteerLifeCycleEvent | PuppeteerLifeCycleEvent[]
  credentials?: Credentials
  headers?: Record<string, string>
  cookies?: Cookie[]
  userAgent?: string
  viewport?: ViewportOptions
  device?: string
  emulateMediaType?: 'screen' | 'print'
  waitForSelector?: string
  waitForSelectorTimeout?: number
  disableCache?: boolean
}

/**
 * HTML 렌더링 요청
 */
export type HtmlOptions = CommonOptions

/**
 * 스크린샷 클립 영역
 */
export interface ClipOptions {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 스크린샷 요청
 */
export interface ScreenshotOptions extends CommonOptions {
  type?: 'png' | 'jpeg' | 'webp'
  quality?: number
  fullPage?: boolean
  clip?: ClipOptions
  omitBackground?: boolean
  encoding?: 'binary' | 'base64'
  animationTimeout?: number
}

/**
 * PDF 여백
 */
export interface PdfMargin {
  top?: string
  right?: string
  bottom?: string
  left?: string
}

/**
 * PDF 생성 요청
 */
export interface PdfOptions extends CommonOptions {
  filename?: string
  contentDisposition?: 'attachment' | 'inline'
  scale?: number
  displayHeaderFooter?: boolean
  headerTemplate?: string
  footerTemplate?: string
  printBackground?: boolean
  landscape?: boolean
  pageRanges?: string
  format?: PaperFormat
  paperWidth?: string
  paperHeight?: string
  margin?: PdfMargin
  preferCSSPageSize?: boolean
}

/**
 * 렌더링 결과
 */
export interface RenderResult<T> {
  data: T
  duration: number
}

/**
 * 에러 코드
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'URL_REQUIRED'
  | 'INVALID_URL'
  | 'NAVIGATION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SELECTOR_NOT_FOUND'
  | 'SCREENSHOT_ERROR'
  | 'PDF_ERROR'
  | 'BROWSER_ERROR'
  | 'INTERNAL_ERROR'

/**
 * 에러 응답
 */
export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
  meta?: {
    duration?: number
    url?: string
    timestamp: string
  }
}

/**
 * 성공 응답
 */
export interface SuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: {
    duration: number
    url: string
    timestamp: string
  }
}
