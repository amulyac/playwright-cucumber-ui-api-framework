import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { UserFactory } from '../models/UserFactory';
import { UserPool } from '../models/UserPool';
import { BaseUser } from '../models/BaseUser';
import { Role } from '../models/Role';

Given('a {string} user created by the user factory', function (this: CustomWorld, role: string) {
  this.currentUser = UserFactory.create(UserFactory.roleFrom(role));
  this.attach(`Created: ${this.currentUser.describe()}`); // shows in the HTML report
});

When('I log in through the UI as that user', async function (this: CustomWorld) {
  const { email, password } = this.currentUser!.credentials; // password only via the getter
  await this.loginPage.login(email, password);
});

/**
 * POLYMORPHISM in action: this ONE step works for every user type.
 * It does not check "if admin / if locked" - each object answers for itself.
 */
Then('the login result should match that user type', async function (this: CustomWorld) {
  const user = this.currentUser!;
  const expected = user.loginExpectation();

  if (!expected.shouldSucceed) {
    await expect(this.loginPage.formError).toHaveText(expected.errorMessage!);
    await expect(this.page).toHaveURL(/\/login$/);
    return;
  }

  await expect(this.page).toHaveURL(/\/profile$/);
  await expect(this.profilePage.welcomeMessage).toHaveText(user.welcomeText);
  await expect(this.profilePage.userRole).toHaveText(user.role);
  if (user.canSeeAdminPanel()) {
    await expect(this.profilePage.adminPanel).toBeVisible();
  } else {
    await expect(this.profilePage.adminPanel).toBeHidden();
  }
});

Given('a user pool containing one user of each type', function (this: CustomWorld) {
  this.userPool = new UserPool<BaseUser>()
    .add(UserFactory.create(Role.Standard))
    .add(UserFactory.create(Role.Admin))
    .add(UserFactory.create(Role.Locked));
});

Then('the user pool should contain {int} users', function (this: CustomWorld, count: number) {
  expect(this.userPool!.size).toBe(count);
});

Then('only the {string} user in the pool should have admin panel access',
  function (this: CustomWorld, role: string) {
    const withAccess = this.userPool!.filter((user) => user.canSeeAdminPanel());
    expect(withAccess.map((user) => user.role)).toEqual([UserFactory.roleFrom(role)]);
  });
