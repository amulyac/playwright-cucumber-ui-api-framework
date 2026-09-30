import { BaseUser } from './BaseUser';
import { Role } from './Role';
import { LoginExpectation } from './interfaces';

/** INHERITANCE - StandardUser IS-A BaseUser and gets all its members. */
export class StandardUser extends BaseUser {
  readonly role: Role = Role.Standard;

  canSeeAdminPanel(): boolean {
    return false;
  }
}

/** INHERITANCE + POLYMORPHISM - same method names, different behaviour. */
export class AdminUser extends BaseUser {
  readonly role: Role = Role.Admin;

  canSeeAdminPanel(): boolean {
    return true;
  }

  /** METHOD OVERRIDING with super - extends the parent's behaviour. */
  override describe(): string {
    return `${super.describe()} (full access)`;
  }
}

/** MULTI-LEVEL INHERITANCE - LockedUser -> StandardUser -> BaseUser. */
export class LockedUser extends StandardUser {
  override readonly role: Role = Role.Locked;

  /** OVERRIDING - a locked user is expected to FAIL login with a specific message. */
  override loginExpectation(): LoginExpectation {
    return { shouldSucceed: false, errorMessage: 'Your account is locked. Please contact support.' };
  }
}
