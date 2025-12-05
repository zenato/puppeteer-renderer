import type { ErrorCode, ErrorResponse } from './types'

export class RenderError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(code: ErrorCode, message: string, statusCode = 500, details?: unknown) {
    super(message)
    this.name = 'RenderError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }

  toJSON(): ErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    }
  }
}

export const Errors = {
  validation: (message: string, details?: unknown) =>
    new RenderError('VALIDATION_ERROR', message, 400, details),

  urlRequired: () => new RenderError('URL_REQUIRED', 'URL parameter is required', 400),

  invalidUrl: (url: string) => new RenderError('INVALID_URL', `Invalid URL: ${url}`, 400),

  navigation: (message: string, url?: string) =>
    new RenderError('NAVIGATION_ERROR', message, 502, { url }),

  timeout: (timeout: number) =>
    new RenderError('TIMEOUT_ERROR', `Operation timed out after ${timeout}ms`, 504),

  selectorNotFound: (selector: string) =>
    new RenderError('SELECTOR_NOT_FOUND', `Selector not found: ${selector}`, 400),

  screenshot: (message: string) => new RenderError('SCREENSHOT_ERROR', message, 500),

  pdf: (message: string) => new RenderError('PDF_ERROR', message, 500),

  browser: (message: string) => new RenderError('BROWSER_ERROR', message, 503),

  internal: (message: string) => new RenderError('INTERNAL_ERROR', message, 500),
}
