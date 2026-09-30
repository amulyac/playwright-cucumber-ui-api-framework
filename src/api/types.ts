/** Request/response contracts of the registration API. */
export type RegisterUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
};

export type UserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

export type ValidationErrorDetail = { field: string; message: string };

export type ErrorResponse = {
  error: string;
  message?: string;
  details?: ValidationErrorDetail[];
};

/** What every API call returns to the steps. */
export type ApiResult<T = any> = {
  status: number;
  headers: Record<string, string>;
  body: T;
  durationMs: number;
};

export type LoginRequest = { email: string; password: string };

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'standard' | 'admin';
};

export type LoginResponse = { token: string; user: AuthUser };
