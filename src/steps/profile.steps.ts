import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

/** Single-column table -> string[] */
const column = (table: DataTable): string[] => table.raw().map((row) => row[0]);

Given('I am on the profile page', async function (this: CustomWorld) {
  await this.profilePage.open();
});

Then('I should see the welcome message {string}', async function (this: CustomWorld, message: string) {
  await expect(this.profilePage.welcomeMessage).toHaveText(message);
});

Then('the user role should be {string}', async function (this: CustomWorld, role: string) {
  await expect(this.profilePage.userRole).toHaveText(role);
});

Then('the admin panel should be visible', async function (this: CustomWorld) {
  await expect(this.profilePage.adminPanel).toBeVisible();
});

Then('the admin panel should not be visible', async function (this: CustomWorld) {
  await expect(this.profilePage.adminPanel).toBeHidden();
});

// ---------------- native <select> dropdown ----------------
When('I select {string} from the country dropdown', async function (this: CustomWorld, country: string) {
  await this.profilePage.selectCountry(country);
});

Then('the country dropdown should show {string}', async function (this: CustomWorld, country: string) {
  await expect(this.profilePage.selectedCountry).toHaveText(country);
});

Then('the country dropdown should have the options:', async function (this: CustomWorld, table: DataTable) {
  await expect(this.profilePage.countryOptions).toHaveText(column(table));
});

// ---------------- custom dropdown ----------------
When('I choose {string} from the language dropdown', async function (this: CustomWorld, language: string) {
  await this.profilePage.selectLanguage(language);
});

Then('the language dropdown should show {string}', async function (this: CustomWorld, language: string) {
  await expect(this.profilePage.languageDropdown.trigger).toHaveText(language);
});

Then('{string} should be marked as selected in the language dropdown',
  async function (this: CustomWorld, language: string) {
    await expect(this.profilePage.languageDropdown.option(language)).toHaveAttribute('aria-selected', 'true');
  });

Then('the language dropdown should have the options:', async function (this: CustomWorld, table: DataTable) {
  await this.profilePage.languageDropdown.open();
  await expect(this.profilePage.languageDropdown.options).toHaveText(column(table));
});

// ---------------- save ----------------
When('I save my preferences', async function (this: CustomWorld) {
  await this.profilePage.savePreferences();
});

Then('I should see the preferences confirmation {string}', async function (this: CustomWorld, message: string) {
  await expect(this.profilePage.preferencesSaved).toBeVisible();
  await expect(this.profilePage.preferencesSaved).toHaveText(message);
});

Then('I should see the preferences error {string}', async function (this: CustomWorld, message: string) {
  await expect(this.profilePage.preferencesError).toHaveText(message);
  await expect(this.profilePage.preferencesSaved).toBeHidden();
});
