import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { RenderError, Errors } from '../lib/errors'
import type { ErrorResponse } from '../lib/types'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  console.error('[Error]', err)

  let renderError: RenderError

  if (err instanceof RenderError) {
    renderError = err
  } else if (err instanceof ZodError) {
    const firstError = err.errors[0]
    const message = firstError?.message || 'Validation error'
    renderError = Errors.validation(message, err.errors)
  } else if (err.message?.includes('net::ERR_')) {
    renderError = Errors.navigation(err.message)
  } else if (err.message?.includes('timeout') || err.message?.includes('Timeout')) {
    renderError = Errors.timeout(30000)
  } else {
    renderError = Errors.internal(err.message || 'Unknown error')
  }

  const response: ErrorResponse = renderError.toJSON()

  res.status(renderError.statusCode).json(response)
}
