import { createHttpHeaders } from '@typespec/ts-http-runtime'
import type { HttpClient, PipelineRequest, PipelineResponse } from '@typespec/ts-http-runtime'
import { CallCalendarClient } from './generated/index.js'
import type { ApiError } from './generated/index.js'

const browserHttpClient: HttpClient = {
  async sendRequest(request: PipelineRequest): Promise<PipelineResponse> {
    const headers: Record<string, string> = {}
    for (const [name, value] of request.headers) headers[name] = value

    const response = await fetch(request.url, {
      method: request.method,
      headers,
      body: typeof request.body === 'string' ? request.body : undefined,
      signal: request.abortSignal,
    })

    return {
      request,
      status: response.status,
      headers: createHttpHeaders(Object.fromEntries(response.headers)),
      bodyAsText: await response.text(),
    }
  },
}

export const api = new CallCalendarClient({
  endpoint: window.location.origin,
  allowInsecureConnection: true,
  httpClient: browserHttpClient,
  retryOptions: { maxRetries: 0 },
})

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly code: ApiError['code'] | 'NETWORK_ERROR' = 'NETWORK_ERROR',
  ) {
    super(message)
  }
}

export function unwrap<T>(result: T | ApiError): T {
  if (result && typeof result === 'object' && 'code' in result && 'message' in result) {
    const error = result as ApiError
    throw new ApiClientError(error.message, error.code)
  }
  return result as T
}

