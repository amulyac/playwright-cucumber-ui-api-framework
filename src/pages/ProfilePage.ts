import path from 'path';
import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CustomDropdown } from '../components/CustomDropdown';

const TEST_FILES_DIR = path.resolve(__dirname, '../../test-data/files');

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  txt: 'text/plain',
};

export class ProfilePage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly userRole: Locator;
  readonly adminPanel: Locator;
  readonly countrySelect: Locator;
  readonly languageDropdown: CustomDropdown; // COMPOSITION - page HAS-A dropdown component
  readonly saveButton: Locator;
  readonly preferencesSaved: Locator;
  readonly preferencesError: Locator;
  readonly fileInput: Locator;
  readonly uploadSuccess: Locator;
  readonly uploadError: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.userRole = page.getByTestId('user-role');
    this.adminPanel = page.getByTestId('admin-panel');
    this.countrySelect = page.getByTestId('country-select');
    this.languageDropdown = new CustomDropdown(page, 'language-dropdown');
    this.saveButton = page.getByTestId('save-preferences');
    this.preferencesSaved = page.getByTestId('preferences-saved');
    this.preferencesError = page.getByTestId('preferences-error');
    this.fileInput = page.getByTestId('avatar-upload');
    this.uploadSuccess = page.getByTestId('upload-success');
    this.uploadError = page.getByTestId('upload-error');
    this.logoutButton = page.getByTestId('logout');
  }

  /** Opens the page and waits until the user data has loaded. */
  async open(): Promise<void> {
    await this.navigate('/profile');
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await this.welcomeMessage.filter({ hasText: 'Welcome,' }).waitFor({ state: 'visible' });
  }

  /** NATIVE <select>: Playwright's selectOption does it in one call. */
  async selectCountry(label: string): Promise<void> {
    await this.countrySelect.selectOption({ label });
  }

  get selectedCountry(): Locator {
    return this.countrySelect.locator('option:checked');
  }

  get countryOptions(): Locator {
    return this.countrySelect.locator('option');
  }

  async selectLanguage(language: string): Promise<void> {
    await this.languageDropdown.select(language);
  }

  async savePreferences(): Promise<void> {
    await this.saveButton.click();
  }

  /** File upload from a real file in test-data/files. */
  async uploadFile(fileName: string): Promise<void> {
    await this.fileInput.setInputFiles(path.join(TEST_FILES_DIR, fileName));
  }

  /** File upload from memory - no file on disk needed (great for size limits). */
  async uploadGeneratedFile(fileName: string, sizeInKb: number): Promise<void> {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    await this.fileInput.setInputFiles({
      name: fileName,
      mimeType: MIME_TYPES[ext] ?? 'application/octet-stream',
      buffer: Buffer.alloc(Math.round(sizeInKb * 1024)),
    });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
