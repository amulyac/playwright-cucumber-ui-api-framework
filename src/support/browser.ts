import { chromium, firefox, webkit, Browser } from '@playwright/test';
import { config } from './config';

/** One browser per run, launched only when a UI scenario needs it. */
let browser: Browser | undefined;
const browsers = { chromium, firefox, webkit };

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await browsers[config.browser].launch({
      headless: config.headless,
      slowMo: config.slowMo,
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  await browser?.close();
  browser = undefined;
}
