@api @login
Feature: Login API
  POST /api/auth/login returns a token and sets a session cookie.
  GET /api/auth/me returns the logged-in user.

  @smoke @positive
  Scenario: Single user logs in through the API
    When I send a login request as the "standard" user
    Then the response status code should be 200
    And the response should have a JSON content type
    And the response body should match the login schema
    And the logged-in user should be the "standard" user
    And the response should not expose the password
    And the session cookie should be set as HttpOnly
    And the response time should be within the allowed limit

  @positive
  Scenario: Multiple users log in through the API
    When I log in through the API with each of these users:
      | user     | expectedRole |
      | standard | standard     |
      | admin    | admin        |
    Then every login should succeed with the expected role

  @positive
  Scenario: The login token gives access to the current user
    Given I am logged in through the API as the "admin" user
    When I request the current user with the token
    Then the response status code should be 200
    And the current user role should be "admin"

  @negative
  Scenario Outline: Login is rejected - <case>
    When I send a login request with email "<email>" and password "<password>"
    Then the response status code should be <status>
    And the response body should match the error schema
    And the response error code should be "<code>"
    And the response error message should be "<message>"

    Examples:
      | case           | email                     | password    | status | code                | message                                          |
      | wrong password | existing.user@example.com | WrongPass!1 | 401    | INVALID_CREDENTIALS | Invalid email or password                        |
      | unknown email  | nobody@example.com        | Passw0rd!23 | 401    | INVALID_CREDENTIALS | Invalid email or password                        |
      | locked account | locked.user@example.com   | Passw0rd!23 | 423    | ACCOUNT_LOCKED      | Your account is locked. Please contact support. |

  @negative
  Scenario: Login is rejected when credentials are missing
    When I send a login request with email "" and password ""
    Then the response status code should be 400
    And the response error code should be "VALIDATION_ERROR"
    And the response should contain the validation error "Email is required" for field "email"
    And the response should contain the validation error "Password is required" for field "password"

  @negative
  Scenario Outline: The current user endpoint needs a valid token - <case>
    When I request the current user <tokenOption>
    Then the response status code should be 401
    And the response error code should be "UNAUTHORIZED"

    Examples:
      | case          | tokenOption                    |
      | no token      | without a token                |
      | invalid token | with the token "invalid-token" |
