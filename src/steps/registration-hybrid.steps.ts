import { When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { validUser } from '../utils/testData';

When('I register in the UI using the email of the API-registered user', async function (this: CustomWorld) {
  await this.registrationPage.register(validUser({ email: String(this.payload.email) }));
});
