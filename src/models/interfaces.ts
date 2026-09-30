/**
 * INTERFACES - contracts that describe a shape or capability, without implementation.
 * Small, focused interfaces (interface segregation): a class implements only what it needs.
 */
export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface LoginExpectation {
  readonly shouldSucceed: boolean;
  readonly errorMessage?: string;
}

export interface Describable {
  describe(): string;
}
