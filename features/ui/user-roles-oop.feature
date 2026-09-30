@ui @oop
Feature: User types - TypeScript OOP model
  Users are objects built by a factory (StandardUser, AdminUser, LockedUser).
  Each class knows its own expected result, so ONE step checks all types (polymorphism).

  Scenario Outline: Each user type gets the right result after login - <role>
    Given a "<role>" user created by the user factory
    And I am on the login page
    When I log in through the UI as that user
    Then the login result should match that user type

    Examples:
      | role     |
      | standard |
      | admin    |
      | locked   |

  Scenario: The generic user pool filters users by what they can do
    Given a user pool containing one user of each type
    Then the user pool should contain 3 users
    And only the "admin" user in the pool should have admin panel access
