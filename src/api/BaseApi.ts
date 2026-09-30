import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiResult } from './types';

/**
 * Abstract base for every API object: shared timing + body parsing lives here once.
 * Each subclass (UsersApi, AuthApi) only adds its own endpoints.
 */
export abstract class BaseApi {
  protected abstract readonly basePath: string;

  constructor(protected readonly request: APIRequestContext) {}

  /** Measures response time and parses the body (JSON if possible, else text). */
  protected async timed(call: () => Promise<APIResponse>): Promise<ApiResult> {
    const start = Date.now();
    const response = await call();
    const durationMs = Date.now() - start;

    const text = await response.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      /* not JSON - keep raw text */
    }
    return { status: response.status(), headers: response.headers(), body, durationMs };
  }
}
