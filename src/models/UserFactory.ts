import { BaseUser } from './BaseUser';
import { AdminUser, LockedUser, StandardUser } from './users';
import { Role } from './Role';
import { testUsers } from '../utils/testUsers';

/**
 * FACTORY PATTERN - one place that knows how to build each user type.
 * Private constructor + static methods = a class you never instantiate.
 */
export class UserFactory {
  private constructor() {}

  /** METHOD OVERLOADS - the return type depends on the role you pass in. */
  static create(role: Role.Admin): AdminUser;
  static create(role: Role.Locked): LockedUser;
  static create(role: Role.Standard): StandardUser;
  static create(role: Role): BaseUser;
  static create(role: Role): BaseUser {
    switch (role) {
      case Role.Admin: {
        const u = testUsers.admin;
        return new AdminUser(u.email, u.password, u.firstName);
      }
      case Role.Locked: {
        const u = testUsers.locked;
        return new LockedUser(u.email, u.password, u.firstName);
      }
      case Role.Standard: {
        const u = testUsers.standard;
        return new StandardUser(u.email, u.password, u.firstName);
      }
    }
  }

  /** Converts text from a feature file into the enum, with a helpful error. */
  static roleFrom(value: string): Role {
    const role = Object.values(Role).find((r) => r === value.toLowerCase());
    if (!role) throw new Error(`Unknown role "${value}". Use: ${Object.values(Role).join(', ')}`);
    return role;
  }
}
