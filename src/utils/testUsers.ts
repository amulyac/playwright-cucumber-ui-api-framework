import { config } from '../support/config';
import { SeedUser } from '../support/demoServer';

/**
 * Test users in ONE place. Credentials come from .env (never hard-code secrets in
 * feature files); the defaults match the users seeded in the demo app.
 */
export type UserKey = 'standard' | 'admin' | 'locked';

export const testUsers: Record<UserKey, SeedUser> = {
  standard: {
    email: config.existingUserEmail,
    password: process.env.STANDARD_USER_PASSWORD ?? 'Passw0rd!23',
    firstName: 'Existing',
    lastName: 'User',
    role: 'standard',
    locked: false,
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
    password: process.env.ADMIN_PASSWORD ?? 'Admin@12345',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    locked: false,
  },
  locked: {
    email: process.env.LOCKED_USER_EMAIL ?? 'locked.user@example.com',
    password: process.env.LOCKED_USER_PASSWORD ?? 'Passw0rd!23',
    firstName: 'Locked',
    lastName: 'User',
    role: 'standard',
    locked: true,
  },
};

/** Look up a user by the key used in feature files, with a clear error for typos. */
export function getTestUser(key: string): SeedUser {
  if (!(key in testUsers)) {
    throw new Error(`Unknown test user "${key}". Use one of: ${Object.keys(testUsers).join(', ')}`);
  }
  return testUsers[key as UserKey];
}
