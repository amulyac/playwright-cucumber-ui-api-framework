import { Role } from './Role';
import { Credentials, Describable, LoginExpectation } from './interfaces';

/**
 * ABSTRACTION  - abstract class: cannot be created directly, defines what every user has.
 * ENCAPSULATION - email/password are private; the outside world only gets read access
 *                 through getters, so tests can't accidentally change them.
 * IMPLEMENTS   - fulfils the Describable interface contract.
 */
export abstract class BaseUser implements Describable {
  /** STATIC member - belongs to the class, shared by all instances. */
  private static instanceCount = 0;

  /** ABSTRACT property - every subclass MUST say what its role is. */
  abstract readonly role: Role;

  /** Parameter properties + ACCESS MODIFIERS: private / protected / readonly. */
  constructor(
    private readonly _email: string,
    private readonly _password: string,
    protected readonly firstName: string,
  ) {
    BaseUser.instanceCount++;
  }

  /** GETTERS - read-only access to private data. */
  get email(): string {
    return this._email;
  }

  get credentials(): Credentials {
    return { email: this._email, password: this._password };
  }

  get welcomeText(): string {
    return `Welcome, ${this.firstName}`;
  }

  /** ABSTRACT method - subclasses decide (this is where polymorphism happens). */
  abstract canSeeAdminPanel(): boolean;

  /** Default behaviour - subclasses may OVERRIDE it. */
  loginExpectation(): LoginExpectation {
    return { shouldSucceed: true };
  }

  describe(): string {
    return `${this.role} user <${this._email}>`;
  }

  /** STATIC getter - called on the class: BaseUser.instancesCreated */
  static get instancesCreated(): number {
    return BaseUser.instanceCount;
  }
}
