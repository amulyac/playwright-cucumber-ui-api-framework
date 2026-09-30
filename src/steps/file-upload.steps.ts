import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

When('I upload the file {string}', async function (this: CustomWorld, fileName: string) {
  await this.profilePage.uploadFile(fileName);
});

When('I upload a generated file {string} of {int} KB',
  async function (this: CustomWorld, fileName: string, sizeInKb: number) {
    await this.profilePage.uploadGeneratedFile(fileName, sizeInKb);
  });

Then('I should see the upload confirmation for {string}', async function (this: CustomWorld, fileName: string) {
  await expect(this.profilePage.uploadSuccess).toBeVisible();
  await expect(this.profilePage.uploadSuccess).toHaveText(`Uploaded: ${fileName}`);
  await expect(this.profilePage.uploadError).toHaveText('');
});

Then('I should see the upload error {string}', async function (this: CustomWorld, message: string) {
  await expect(this.profilePage.uploadError).toHaveText(message);
  await expect(this.profilePage.uploadSuccess).toBeHidden();
});
