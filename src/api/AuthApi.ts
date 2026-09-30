import { BaseApi } from './BaseApi';
import { ApiResult } from './types';

/** API Object Model for /api/auth - login, current user, logout. */
export class AuthApi extends BaseApi {
  protected readonly basePath = '/api/auth';

  /** POST /api/auth/login */
  async login(email: string, password: string): Promise<ApiResult> {
    return this.timed(() => this.request.post(`${this.basePath}/login`, { data: { email, password } }));
  }

  /** GET /api/auth/me - with a Bearer token, or without one to test 401. */
  async me(token?: string): Promise<ApiResult> {
    const headers: Record<string, string> = token !== undefined ? { Authorization: `Bearer ${token}` } : {};
    return this.timed(() => this.request.get(`${this.basePath}/me`, { headers }));
  }

  /** POST /api/auth/logout */
  async logout(token: string): Promise<ApiResult> {
    return this.timed(() =>
      this.request.post(`${this.basePath}/logout`, { headers: { Authorization: `Bearer ${token}` } }),
    );
  }
}
