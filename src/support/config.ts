import * as dotenv from 'dotenv';

dotenv.config();

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

export const config = {
  baseUrl,
  apiBaseUrl: process.env.API_BASE_URL || baseUrl,
  useDemoApp: process.env.USE_DEMO_APP !== 'false',
  browser: (process.env.BROWSER ?? 'chromium') as BrowserName,
  headless: process.env.HEADLESS !== 'false',
  slowMo: Number(process.env.SLOW_MO ?? 0),
  defaultTimeout: Number(process.env.DEFAULT_TIMEOUT ?? 30000),
  apiMaxResponseMs: Number(process.env.API_MAX_RESPONSE_MS ?? 2000),
  existingUserEmail: process.env.EXISTING_USER_EMAIL ?? 'existing.user@example.com',
};
