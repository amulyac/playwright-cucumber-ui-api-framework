import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type LoginField = 'email' | 'password';

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly formError: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Log in' });
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.formError = page.getByTestId('login-error');
  }

  async open(): Promise<void> {
    await this.navigate('/login');
    await this.heading.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  input(field: LoginField): Locator {
    return field === 'email' ? this.emailInput : this.passwordInput;
  }

  fieldError(field: LoginField): Locator {
    return this.page.getByTestId(`login-${field}-error`);
  }
}
