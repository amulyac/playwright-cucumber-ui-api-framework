import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { config } from '../support/config';
import { validApiPayload } from '../utils/testData';
import { validateSchema, userResponseSchema, errorResponseSchema, Schema } from '../api/schemas';
import { ApiResult, ValidationErrorDetail } from '../api/types';

/** Guard so a missing request gives a clear message instead of "undefined". */
function lastResult(world: CustomWorld): ApiResult {
  if (!world.apiResult) throw new Error('No API response yet - did a "When I send..." step run?');
  return world.apiResult;
}

function expectSchema(body: unknown, schema: Schema): void {
  const problems = validateSchema(body, schema);
  expect(problems, `Schema problems:\n${problems.join('\n')}`).toEqual([]);
}

// ---------------------------------------------------------------- Given (arrange)

Given('I have a valid registration payload', function (this: CustomWorld) {
  this.payload = validApiPayload();
});

Given('I set {string} to {string} in the payload', function (this: CustomWorld, field: string, value: string) {
  // Booleans from Gherkin arrive as text - convert so we send real JSON types
  this.payload[field] = value === 'true' ? true : value === 'false' ? false : value;
});

Given('I remove {string} from the payload', function (this: CustomWorld, field: string) {
  delete this.payload[field];
});

Given('I have a registration payload with an already registered email', function (this: CustomWorld) {
  this.payload = validApiPayload({ email: config.existingUserEmail });
});

Given('a user has been registered via the API', async function (this: CustomWorld) {
  this.payload = validApiPayload();
  const result = await this.usersApi.register(this.payload);
  expect(result.status, `Setup failed: ${JSON.stringify(result.body)}`).toBe(201);
  this.createdUserId = result.body.id;
});

Given('I reuse the registered email in upper case', function (this: CustomWorld) {
  this.payload = validApiPayload({ email: String(this.payload.email).toUpperCase() });
});

// ---------------------------------------------------------------- When (act)

When('I send a POST request to register the user', async function (this: CustomWorld) {
  this.apiResult = await this.usersApi.register(this.payload);
  if (this.apiResult.status === 201) this.createdUserId = this.apiResult.body.id;
});

When('I send a POST request with a malformed JSON body', async function (this: CustomWorld) {
  this.apiResult = await this.usersApi.registerRaw('{"firstName": "John", "email": ');
});

When('I fetch the registered user by id', async function (this: CustomWorld) {
  expect(this.createdUserId, 'No user id from a previous registration').toBeTruthy();
  this.apiResult = await this.usersApi.getUser(this.createdUserId!);
});

When('I fetch the user with id {string}', async function (this: CustomWorld, id: string) {
  this.apiResult = await this.usersApi.getUser(id);
});

// ---------------------------------------------------------------- Then (assert)

Then('the response status code should be {int}', function (this: CustomWorld, status: number) {
  const result = lastResult(this);
  expect(result.status, `Body: ${JSON.stringify(result.body)}`).toBe(status);
});

Then('the response should have a JSON content type', function (this: CustomWorld) {
  expect(lastResult(this).headers['content-type']).toContain('application/json');
});

Then('the response body should match the user schema', function (this: CustomWorld) {
  expectSchema(lastResult(this).body, userResponseSchema);
});

Then('the response body should match the error schema', function (this: CustomWorld) {
  expectSchema(lastResult(this).body, errorResponseSchema);
});

Then('the response body should contain the submitted user details', function (this: CustomWorld) {
  const body = lastResult(this).body;
  expect(body.firstName).toBe(this.payload.firstName);
  expect(body.lastName).toBe(this.payload.lastName);
  expect(body.email).toBe(String(this.payload.email).toLowerCase()); // API normalises email
  expect(body.id).toBeTruthy();
});

Then('the response should not expose the password', function (this: CustomWorld) {
  const result = lastResult(this);
  expect(result.body).not.toHaveProperty('password');
  expect(JSON.stringify(result.body)).not.toContain(String(this.payload.password));
});

Then('the Location header should point to the new user', function (this: CustomWorld) {
  const result = lastResult(this);
  expect(result.headers['location']).toBe(`/api/users/${result.body.id}`);
});

Then('the response time should be within the allowed limit', function (this: CustomWorld) {
  expect(lastResult(this).durationMs).toBeLessThan(config.apiMaxResponseMs);
});

Then('the response error code should be {string}', function (this: CustomWorld, code: string) {
  expect(lastResult(this).body.error).toBe(code);
});

Then('the response error message should be {string}', function (this: CustomWorld, message: string) {
  expect(lastResult(this).body.message).toBe(message);
});

Then('the response should contain the validation error {string} for field {string}',
  function (this: CustomWorld, message: string, field: string) {
    const details: ValidationErrorDetail[] = lastResult(this).body.details ?? [];
    expect(details).toContainEqual({ field, message });
  });
