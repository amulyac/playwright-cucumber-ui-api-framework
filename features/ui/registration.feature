@registration
Feature: User Registration
  As a new visitor
  I want to create an account
  So that I can access member-only features

  Background:
    Given I am on the registration page

  @smoke @positive
  Scenario: Successful registration with valid details
    When I register with valid details
    Then I should see the registration success message "Account created successfully"

  @negative
  Scenario Outline: Registration fails with invalid input - <case>
    When I fill the registration form with:
      | firstName       | <firstName>       |
      | lastName        | <lastName>        |
      | email           | <email>           |
      | password        | <password>        |
      | confirmPassword | <confirmPassword> |
      | acceptTerms     | <acceptTerms>     |
    And I submit the registration form
    Then I should see the error "<error>" for field "<field>"
    And I should remain on the registration page

    Examples:
      | case               | firstName | lastName | email         | password    | confirmPassword | acceptTerms | field           | error                                  |
      | empty first name   |           | Smith    | <unique>      | Passw0rd!23 | Passw0rd!23     | true        | firstName       | First name is required                 |
      | invalid email      | John      | Smith    | invalid-email | Passw0rd!23 | Passw0rd!23     | true        | email           | Enter a valid email address            |
      | weak password      | John      | Smith    | <unique>      | abc         | abc             | true        | password        | Password must be at least 8 characters |
      | password mismatch  | John      | Smith    | <unique>      | Passw0rd!23 | Different!99    | true        | confirmPassword | Passwords do not match                 |
      | terms not accepted | John      | Smith    | <unique>      | Passw0rd!23 | Passw0rd!23     | false       | terms           | You must accept the terms              |

  @negative
  Scenario: Registration fails with an already registered email
    When I register using an already registered email
    Then I should see the error "An account with this email already exists" for field "email"

  @negative
  Scenario: Registration fails when Register is clicked with an empty form
    When I click on register button
    Then I should see the error "First name is required" for field "firstName"
    And I should see the error "Enter a valid email address" for field "email"
    And I should remain on the registration page
