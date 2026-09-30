import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { getTestUser } from '../utils/testUsers';
import { validateSchema, loginResponseSchema, authUserSchema } from '../api/schemas';

When('I send a login request as the {string} user', async function (this: CustomWorld, userKey: string) {
  const user = getTestUser(userKey);
  this.payload = { email: user.email, password: user.password };
  this.apiResult = await this.authApi.login(user.email, user.password);
});

When('I send a login request with email {string} and password {string}',
  async function (this: CustomWorld, email: string, password: string) {
    this.payload = { email, password };
    this.apiResult = await this.authApi.login(email, password);
  });

Given('I am logged in through the API as the {string} user', async function (this: CustomWorld, userKey: string) {
  const user = getTestUser(userKey);
  const result = await this.authApi.login(user.email, user.password);
  expect(result.status, `Login setup failed: ${JSON.stringify(result.body)}`).toBe(200);
  this.authToken = result.body.token;
});

When('I request the current user with the token', async function (this: CustomWorld) {
  this.apiResult = await this.authApi.me(this.authToken);
});

When('I request the current user with the token {string}', async function (this: CustomWorld, token: string) {
  this.apiResult = await this.authApi.me(token);
});

When('I request the current user without a token', async function (this: CustomWorld) {
  this.apiResult = await this.authApi.me();
});

// ---------------- multiple users: DataTable.hashes() -> one object per row ----------------
When('I log in through the API with each of these users:', async function (this: CustomWorld, table: DataTable) {
  this.loginAttempts = [];
  for (const row of table.hashes()) {
    const user = getTestUser(row.user);
    const result = await this.authApi.login(user.email, user.password);
    this.loginAttempts.push({
      user: row.user,
      expectedRole: row.expectedRole,
      status: result.status,
      role: result.body?.user?.role,
    });
  }
});

Then('every login should succeed with the expected role', function (this: CustomWorld) {
  expect(this.loginAttempts.length).toBeGreaterThan(0);
  for (const attempt of this.loginAttempts) {
    expect(attempt.status, `Status for "${attempt.user}"`).toBe(200);
    expect(attempt.role, `Role for "${attempt.user}"`).toBe(attempt.expectedRole);
  }
});

// ---------------- response checks ----------------
Then('the response body should match the login schema', function (this: CustomWorld) {
  const body = this.apiResult?.body;
  const problems = [...validateSchema(body, loginResponseSchema), ...validateSchema(body?.user, authUserSchema)];
  expect(problems, `Schema problems:\n${problems.join('\n')}`).toEqual([]);
});

Then('the logged-in user should be the {string} user', function (this: CustomWorld, userKey: string) {
  const expected = getTestUser(userKey);
  const user = this.apiResult?.body?.user;
  expect(user.email).toBe(expected.email.toLowerCase());
  expect(user.firstName).toBe(expected.firstName);
  expect(user.role).toBe(expected.role);
});

Then('the session cookie should be set as HttpOnly', function (this: CustomWorld) {
  const cookie = this.apiResult?.headers['set-cookie'] ?? '';
  expect(cookie).toContain('session=');
  expect(cookie).toContain('HttpOnly'); // JavaScript cannot read it -> protects against XSS token theft
});

Then('the current user role should be {string}', function (this: CustomWorld, role: string) {
  expect(this.apiResult?.body?.role).toBe(role);
});
