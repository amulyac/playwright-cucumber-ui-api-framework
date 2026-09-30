import fs from 'fs';
import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { SessionManager } from '../support/SessionManager';
import { getBrowser } from '../support/browser';
import { config } from '../support/config';
import { ProfilePage } from '../pages/ProfilePage';

When('I save the browser session to {string}', async function (this: CustomWorld, fileName: string) {
  // Writes cookies + localStorage of the current (logged-in) browser to a JSON file
  await this.context.storageState({ path: SessionManager.filePath(fileName) });
});

Then('the storage state file {string} should contain the session cookie',
  function (this: CustomWorld, fileName: string) {
    const state = JSON.parse(fs.readFileSync(SessionManager.filePath(fileName), 'utf-8'));
    const names = state.cookies.map((c: { name: string }) => c.name);
    expect(names).toContain('session');
  });

When('I open a new browser using the saved session {string}', async function (this: CustomWorld, fileName: string) {
  // A brand-new context (like a new incognito window) - but started FROM the saved file
  const context = await (await getBrowser()).newContext({
    baseURL: config.baseUrl,
    storageState: SessionManager.filePath(fileName),
  });
  this.extraContexts.push(context); // closed by the After hook
  this.secondaryPage = await context.newPage();
  await this.secondaryPage.goto('/profile');
});

Then('the new browser should show the profile page without logging in', async function (this: CustomWorld) {
  const page = this.secondaryPage!;
  await expect(page).toHaveURL(/\/profile$/);
  await expect(new ProfilePage(page).welcomeMessage).toHaveText('Welcome, Existing');
});
