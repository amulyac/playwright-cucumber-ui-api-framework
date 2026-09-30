import { Page } from '@playwright/test';

/** Common behaviour shared by every page object. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path); // resolved against baseURL from the context
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
