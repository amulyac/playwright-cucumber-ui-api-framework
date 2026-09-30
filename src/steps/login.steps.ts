import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { getTestUser } from '../utils/testUsers';
import { LoginField } from '../pages/LoginPage';

Given('I am on the login page', async function (this: CustomWorld) {
  await this.loginPage.open();
});

When('I log in as the {string} user', async function (this: CustomWorld, userKey: string) {
  const user = getTestUser(userKey); // credentials come from .env, not the feature file
  await this.loginPage.login(user.email, user.password);
});

When('I log in with email {string} and password {string}',
  async function (this: CustomWorld, email: string, password: string) {
    await this.loginPage.login(email, password);
  });

When('I log in through the UI with the API-registered user', async function (this: CustomWorld) {
  await this.loginPage.login(String(this.payload.email), String(this.payload.password));
});

When('I log out', async function (this: CustomWorld) {
  await this.profilePage.logout();
});

When('I try to open the profile page', async function (this: CustomWorld) {
  await this.page.goto('/profile');
});

Then('I should be on the profile page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/profile$/);
  await this.profilePage.waitUntilLoaded();
});

Then('I should stay on the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login$/);
});

Then('I should be redirected to the login page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login$/);
  await expect(this.loginPage.heading).toBeVisible();
});

// ---------------- error message verification ----------------

Then('I should see the login error {string}', async function (this: CustomWorld, message: string) {
  await expect(this.loginPage.formError).toBeVisible();          // it is shown
  await expect(this.loginPage.formError).toHaveText(message);    // exact text
  await expect(this.loginPage.formError).toHaveAttribute('role', 'alert'); // announced to screen readers
});

Then('I should see the login field error {string} for {string}',
  async function (this: CustomWorld, message: string, field: string) {
    await expect(this.loginPage.fieldError(field as LoginField)).toHaveText(message);
  });

Then('the {string} field should be marked as invalid', async function (this: CustomWorld, field: string) {
  await expect(this.loginPage.input(field as LoginField)).toHaveAttribute('aria-invalid', 'true');
});

Then('the login error banner should not be shown', async function (this: CustomWorld) {
  await expect(this.loginPage.formError).toBeHidden();
});
