import { Locator, Page } from '@playwright/test';

/**
 * COMPONENT OBJECT for a custom dropdown (button + role="listbox"), i.e. NOT a <select>.
 * selectOption() does not work on these - you must click to open, then click the option.
 * Reusable: any page can compose it (composition over inheritance).
 */
export class CustomDropdown {
  readonly trigger: Locator;
  readonly listbox: Locator;

  constructor(page: Page, testId: string) {
    this.trigger = page.getByTestId(testId);
    this.listbox = page.getByTestId(`${testId}-options`);
  }

  /**
   * includeHidden: getByRole skips hidden elements by default, and this list is
   * hidden whenever the dropdown is closed. Without it, checking an option's
   * state (aria-selected) after the list closes would fail with "not found".
   */
  get options(): Locator {
    return this.listbox.getByRole('option', { includeHidden: true });
  }

  option(name: string): Locator {
    return this.listbox.getByRole('option', { name, exact: true, includeHidden: true });
  }

  async open(): Promise<void> {
    if ((await this.trigger.getAttribute('aria-expanded')) !== 'true') {
      await this.trigger.click();
    }
    await this.listbox.waitFor({ state: 'visible' });
  }

  async select(optionText: string): Promise<void> {
    await this.open();
    await this.option(optionText).click();
    await this.listbox.waitFor({ state: 'hidden' });
  }
}
