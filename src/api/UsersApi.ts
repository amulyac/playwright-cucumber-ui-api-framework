import { BaseApi } from './BaseApi';
import { ApiResult } from './types';

/**
 * API Object Model for /api/users - the API equivalent of a Page Object.
 * No assertions here - steps decide what to check.
 */
export class UsersApi extends BaseApi {
  protected readonly basePath = '/api/users';

  /** POST /api/users with a JSON payload. */
  async register(payload: Record<string, unknown>): Promise<ApiResult> {
    return this.timed(() => this.request.post(this.basePath, { data: payload }));
  }

  /** POST /api/users with a raw string body (e.g. malformed JSON). */
  async registerRaw(rawBody: string): Promise<ApiResult> {
    return this.timed(() =>
      this.request.post(this.basePath, {
        data: rawBody,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  /** GET /api/users/{id} */
  async getUser(id: string): Promise<ApiResult> {
    return this.timed(() => this.request.get(`${this.basePath}/${encodeURIComponent(id)}`));
  }
}
