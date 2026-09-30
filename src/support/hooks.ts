import {
  BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout,
} from '@cucumber/cucumber';
import { request } from '@playwright/test';
import { CustomWorld } from './world';
import { config } from './config';
import { getBrowser, closeBrowser } from './browser';
import { SessionManager } from './SessionManager';
import { startDemoServer, stopDemoServer } from './demoServer';
import { testUsers } from '../utils/testUsers';
import { RegistrationPage } from '../pages/RegistrationPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { UsersApi } from '../api/UsersApi';
import { AuthApi } from '../api/AuthApi';

setDefaultTimeout(config.defaultTimeout);

const SESSION_TAG = '@session:';

BeforeAll(async function () {
  if (config.useDemoApp) await startDemoServer(config.baseUrl, Object.values(testUsers));
});

// ---------- API: every scenario gets its own HTTP client (cheap, no browser) ----------
Before(async function (this: CustomWorld) {
  this.apiContext = await request.newContext({
    baseURL: config.apiBaseUrl,
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  this.usersApi = new UsersApi(this.apiContext);
  this.authApi = new AuthApi(this.apiContext);
});

// ---------- UI: browser context only for scenarios NOT tagged @api ----------
// A tag like @session:standard or @session:admin starts the browser ALREADY LOGGED IN
// by loading that user's storage-state file.
Before({ tags: 'not @api' }, async function (this: CustomWorld, { pickle }) {
  const sessionTag = pickle.tags.map((t) => t.name).find((name) => name.startsWith(SESSION_TAG));
  const storageState = sessionTag
    ? await SessionManager.storageStateFor(sessionTag.slice(SESSION_TAG.length))
    : undefined;

  this.context = await (await getBrowser()).newContext({
    baseURL: config.baseUrl,
    viewport: { width: 1366, height: 768 },
    storageState,
  });
  await this.context.tracing.start({ screenshots: true, snapshots: true });
  this.page = await this.context.newPage();
  this.registrationPage = new RegistrationPage(this.page);
  this.loginPage = new LoginPage(this.page);
  this.profilePage = new ProfilePage(this.page);
});

// UI evidence on failure: screenshot attached to report + Playwright trace
After({ tags: 'not @api' }, async function (this: CustomWorld, { pickle, result }) {
  const name = pickle.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase();

  if (result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot({
      path: `reports/screenshots/${name}.png`,
      fullPage: true,
    });
    this.attach(screenshot, 'image/png');
    await this.context.tracing.stop({ path: `reports/traces/${name}.zip` });
  } else {
    await this.context.tracing.stop();
  }

  for (const extra of this.extraContexts) await extra.close();
  await this.page.close();
  await this.context.close();
});

// API evidence on failure: last request/response attached to report
After(async function (this: CustomWorld, { result }) {
  if (result?.status === Status.FAILED && this.apiResult) {
    this.attach(
      JSON.stringify({ requestPayload: this.payload, response: this.apiResult }, null, 2),
      'application/json',
    );
  }
  await this.apiContext?.dispose();
});

AfterAll(async function () {
  await closeBrowser();
  if (config.useDemoApp) await stopDemoServer();
});
