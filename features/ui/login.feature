@ui @login
Feature: Login (UI)
  As a registered user
  I want to log in
  So that I can reach my profile

  Background:
    Given I am on the login page

  @smoke @positive
  Scenario: Single user logs in successfully
    When I log in as the "standard" user
    Then I should be on the profile page
    And I should see the welcome message "Welcome, Existing"
    And the user role should be "standard"

  @positive
  Scenario Outline: Multiple users can log in - <user> user
    When I log in as the "<user>" user
    Then I should be on the profile page
    And I should see the welcome message "Welcome, <firstName>"
    And the user role should be "<role>"

    Examples:
      | user     | firstName | role     |
      | standard | Existing  | standard |
      | admin    | Admin     | admin    |

  @positive
  Scenario: A newly registered user can log in
    Given a user has been registered via the API
    When I log in through the UI with the API-registered user
    Then I should be on the profile page
    And I should see the welcome message "Welcome, John"

  @negative
  Scenario Outline: Login error message - <case>
    When I log in with email "<email>" and password "<password>"
    Then I should see the login error "<message>"
    And I should stay on the login page

    Examples:
      | case           | email                     | password    | message                                          |
      | wrong password | existing.user@example.com | WrongPass!1 | Invalid email or password                        |
      | unknown email  | nobody@example.com        | Passw0rd!23 | Invalid email or password                        |
      | locked account | locked.user@example.com   | Passw0rd!23 | Your account is locked. Please contact support. |

  @negative
  Scenario Outline: Required field error message - <case>
    When I log in with email "<email>" and password "<password>"
    Then I should see the login field error "<message>" for "<field>"
    And the "<field>" field should be marked as invalid
    And the login error banner should not be shown

    Examples:
      | case           | email                     | password    | field    | message              |
      | empty email    |                           | Passw0rd!23 | email    | Email is required    |
      | empty password | existing.user@example.com |             | password | Password is required |

  Scenario: Logging out ends the session
    When I log in as the "standard" user
    And I log out
    Then I should be redirected to the login page
    When I try to open the profile page
    Then I should be redirected to the login page
