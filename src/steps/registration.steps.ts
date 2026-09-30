import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { config } from '../support/config';
import { RegistrationData, RegistrationField } from '../pages/RegistrationPage';
import { validUser, resolveToken } from '../utils/testData';

Given('I am on the registration page', async function (this: CustomWorld) {
  await this.registrationPage.open();
});

When('I register with valid details', async function (this: CustomWorld) {
  const user = validUser();
  this.testData.email = user.email; // keep for later steps / cleanup
  await this.registrationPage.register(user);
});

When('I fill the registration form with:', async function (this: CustomWorld, table: DataTable) {
  const row = table.rowsHash(); // 2-column table -> { firstName: 'John', ... }
  const data: Partial<RegistrationData> = {
    firstName: row.firstName,
    lastName: row.lastName,
    email: resolveToken(row.email),
    password: row.password,
    confirmPassword: row.confirmPassword,
    acceptTerms: row.acceptTerms === 'true',
  };
  await this.registrationPage.fillForm(data);
});

When('I submit the registration form', async function (this: CustomWorld) {
  await this.registrationPage.submit();
});

When('I register using an already registered email', async function (this: CustomWorld) {
  await this.registrationPage.register(validUser({ email: config.existingUserEmail }));
});

Then('I should see the registration success message {string}',
  async function (this: CustomWorld, message: string) {
    await expect(this.registrationPage.successMessage).toBeVisible();
    await expect(this.registrationPage.successMessage).toContainText(message);
  });

Then('I should see the error {string} for field {string}',
  async function (this: CustomWorld, error: string, field: string) {
    await expect(this.registrationPage.fieldError(field as RegistrationField)).toHaveText(error);
  });

Then('I should remain on the registration page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/register/);
});

When('I click on register button', async function (this: CustomWorld) {
  await this.registrationPage.submit();
});
