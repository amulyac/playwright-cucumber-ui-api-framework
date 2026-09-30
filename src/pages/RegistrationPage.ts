import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export type RegistrationField =
  | 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'terms';

/** Maps logical field names (used in Gherkin) to data-testid prefixes in the app. */
const FIELD_TEST_IDS: Record<RegistrationField, string> = {
  firstName: 'first-name',
  lastName: 'last-name',
  email: 'email',
  password: 'password',
  confirmPassword: 'confirm-password',
  terms: 'terms',
};

export class RegistrationPage extends BasePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Create account' });
    this.firstNameInput = page.getByTestId('first-name');
    this.lastNameInput = page.getByTestId('last-name');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.confirmPasswordInput = page.getByTestId('confirm-password');
    this.termsCheckbox = page.getByTestId('terms');
    this.submitButton = page.getByRole('button', { name: 'Register' });
    this.successMessage = page.getByTestId('registration-success');
  }

  async open(): Promise<void> {
    await this.navigate('/register');
    await this.heading.waitFor({ state: 'visible' });
  }

  /** Fills only the fields provided; empty strings are filled (to test "required"). */
  async fillForm(data: Partial<RegistrationData>): Promise<void> {
    if (data.firstName !== undefined) await this.firstNameInput.fill(data.firstName);
    if (data.lastName !== undefined) await this.lastNameInput.fill(data.lastName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    if (data.confirmPassword !== undefined) await this.confirmPasswordInput.fill(data.confirmPassword);
    if (data.acceptTerms !== undefined) await this.termsCheckbox.setChecked(data.acceptTerms);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Business-level action: fill + submit in one call. */
  async register(data: RegistrationData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  fieldError(field: RegistrationField): Locator {
    return this.page.getByTestId(`${FIELD_TEST_IDS[field]}-error`);
  }
}
