import { BaseUser } from './BaseUser';

/**
 * GENERICS - one class that works with any user type.
 * The constraint <T extends BaseUser> means T must be some kind of user,
 * so we can safely call user methods (email, canSeeAdminPanel...).
 */
export class UserPool<T extends BaseUser> {
  private readonly users = new Map<string, T>();

  /** Returns `this` so calls can be chained: pool.add(a).add(b) */
  add(user: T): this {
    this.users.set(user.email, user);
    return this;
  }

  get(email: string): T | undefined {
    return this.users.get(email);
  }

  /** Accepts a function (callback) - works for any rule you pass in. */
  filter(predicate: (user: T) => boolean): T[] {
    return [...this.users.values()].filter(predicate);
  }

  get size(): number {
    return this.users.size;
  }
}
