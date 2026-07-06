import type { KeqMiddleware } from 'keq'
import { createExceptionByStatusCode } from '@keq-request/exception'
import type { ExceptionDetail } from '@buka/exception'
import { Logger } from '@nestjs/common'
import { BukaRequestException, type BukaRequestExceptionOptions } from './buka-request.exception'

const logger = new Logger('KeqMiddleware:throwOnResponseError')

export interface ThrowOnResponseErrorOptions {
  errorDispatchers?: Record<string, new (statusCode: number, message: string, options: BukaRequestExceptionOptions) => BukaRequestException>
  /**
   * 开启后，错误体解析失败时输出 debug 日志
   * @default false
   */
  debug?: boolean
}

export function throwOnResponseError(options?: ThrowOnResponseErrorOptions): KeqMiddleware {
  const { errorDispatchers, debug } = options ?? {}

  const middleware: KeqMiddleware = async (ctx, next) => {
    await next()

    if (!ctx.response || (ctx.response.status >= 200 && ctx.response.status < 400)) return

    const response = ctx.response
    const contentType = response.headers.get('content-type')

    if (!contentType?.includes('application/json')) {
      throw createExceptionByStatusCode(response)
    }

    let body: unknown
    try {
      body = await response.json()
    } catch (err) {
      if (debug) {
        logger.debug('响应体 JSON 解析失败，降级为状态码异常', err instanceof Error ? err.stack : err)
      }
      throw createExceptionByStatusCode(response)
    }

    if (body !== null && typeof body === 'object' && 'error' in body) {
      const { error } = body as { error: { code: string; message: string; details: ExceptionDetail[] } }
      const exceptionOptions: BukaRequestExceptionOptions = {
        code: error.code,
        details: error.details,
        response,
        fatal: [401, 403, 404].includes(response.status),
      }

      if (errorDispatchers && error.code in errorDispatchers) {
        try {
          const ExceptionClass = errorDispatchers[error.code]
          throw new ExceptionClass(response.status, error.message, exceptionOptions)
        } catch (caught) {
          if (debug) {
            logger.debug(
              '自定义异常派发失败，降级为 BukaRequestException',
              caught instanceof Error ? caught.stack : caught,
            )
          }
        }
      }

      throw new BukaRequestException(response.status, error.message, exceptionOptions)
    }

    throw createExceptionByStatusCode(response)
  }

  middleware.__keqMiddlewareName__ = 'throwOnResponseError'
  return middleware
}
