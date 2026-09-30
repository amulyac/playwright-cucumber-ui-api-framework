import { RegistrationData } from '../pages/RegistrationPage';
import { RegisterUserRequest } from '../api/types';

/** Unique email per run so tests never collide with existing accounts. */
export function uniqueEmail(prefix = 'qa.user'): string {
  const rand = Math.floor(Math.random() * 10000);
  return `${prefix}.${Date.now()}.${rand}@example.com`;
}

/** Valid data for the UI form. */
export function validUser(overrides: Partial<RegistrationData> = {}): RegistrationData {
  return {
    firstName: 'John',
    lastName: 'Smith',
    email: uniqueEmail(),
    password: 'Passw0rd!23',
    confirmPassword: 'Passw0rd!23',
    acceptTerms: true,
    ...overrides,
  };
}

/** Valid payload for the API (no confirmPassword - that is a UI-only concern). */
export function validApiPayload(overrides: Partial<RegisterUserRequest> = {}): RegisterUserRequest {
  return {
    firstName: 'John',
    lastName: 'Smith',
    email: uniqueEmail('api.user'),
    password: 'Passw0rd!23',
    acceptTerms: true,
    ...overrides,
  };
}

/** Resolves special tokens used in feature files, e.g. <unique> -> generated email. */
export function resolveToken(value: string): string {
  return value === '<unique>' ? uniqueEmail() : value;
}
