import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { APIRequestContext, BrowserContext, Page } from '@playwright/test';
import { RegistrationPage } from '../pages/RegistrationPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UsersApi } from '../api/UsersApi';
import { AuthApi } from '../api/AuthApi';
import { ApiResult } from '../api/types';
import { BaseUser } from '../models/BaseUser';
import { UserPool } from '../models/UserPool';

export type LoginAttempt = { user: string; expectedRole: string; status: number; role?: string };

/**
 * Custom World: a fresh instance is created for EVERY scenario,
 * so state (pages, API clients, payloads, responses) never leaks between scenarios.
 */
export class CustomWorld extends World {
  // ---- UI ----
  context!: BrowserContext;
  page!: Page;
  registrationPage!: RegistrationPage;
  loginPage!: LoginPage;
  profilePage!: ProfilePage;
  extraContexts: BrowserContext[] = []; // e.g. a second browser opened from a storage-state file
  secondaryPage?: Page;
  testData: Record<string, string> = {};

  // ---- API ----
  apiContext!: APIRequestContext;
  usersApi!: UsersApi;
  authApi!: AuthApi;
  payload: Record<string, unknown> = {};
  apiResult?: ApiResult;
  createdUserId?: string;
  authToken?: string;
  loginAttempts: LoginAttempt[] = [];

  // ---- OOP model ----
  currentUser?: BaseUser;
  userPool?: UserPool<BaseUser>;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
