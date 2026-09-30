@api @registration
Feature: User Registration API
  As an API consumer (web app, mobile app, partner system)
  I want to register users through POST /api/users
  So that accounts are created with correct validation and data

  @smoke @positive
  Scenario: Register a new user successfully
    Given I have a valid registration payload
    When I send a POST request to register the user
    Then the response status code should be 201
    And the response should have a JSON content type
    And the response body should match the user schema
    And the response body should contain the submitted user details
    And the response should not expose the password
    And the Location header should point to the new user
    And the response time should be within the allowed limit

  @positive
  Scenario: A registered user is saved and can be retrieved
    Given a user has been registered via the API
    When I fetch the registered user by id
    Then the response status code should be 200
    And the response body should match the user schema
    And the response body should contain the submitted user details
    And the response should not expose the password

  @negative
  Scenario Outline: Registration is rejected with invalid data - <case>
    Given I have a valid registration payload
    And I set "<field>" to "<value>" in the payload
    When I send a POST request to register the user
    Then the response status code should be 400
    And the response body should match the error schema
    And the response error code should be "VALIDATION_ERROR"
    And the response should contain the validation error "<message>" for field "<field>"

    Examples:
      | case               | field       | value         | message                                |
      | empty first name   | firstName   |               | First name is required                 |
      | empty last name    | lastName    |               | Last name is required                  |
      | invalid email      | email       | invalid-email | Enter a valid email address            |
      | short password     | password    | abc           | Password must be at least 8 characters |
      | terms not accepted | acceptTerms | false         | You must accept the terms              |

  @negative
  Scenario: Registration is rejected when a required field is missing
    Given I have a valid registration payload
    And I remove "email" from the payload
    When I send a POST request to register the user
    Then the response status code should be 400
    And the response should contain the validation error "Enter a valid email address" for field "email"

  @negative
  Scenario: Registration is rejected for an already registered email
    Given I have a registration payload with an already registered email
    When I send a POST request to register the user
    Then the response status code should be 409
    And the response body should match the error schema
    And the response error code should be "EMAIL_ALREADY_EXISTS"
    And the response error message should be "An account with this email already exists"

  @negative
  Scenario: Duplicate check ignores email letter case
    Given a user has been registered via the API
    And I reuse the registered email in upper case
    When I send a POST request to register the user
    Then the response status code should be 409
    And the response error code should be "EMAIL_ALREADY_EXISTS"

  @negative
  Scenario: Registration is rejected for a malformed JSON body
    When I send a POST request with a malformed JSON body
    Then the response status code should be 400
    And the response error code should be "INVALID_JSON"

  @negative
  Scenario: Fetching a user that does not exist returns 404
    When I fetch the user with id "00000000-0000-0000-0000-000000000000"
    Then the response status code should be 404
    And the response error code should be "USER_NOT_FOUND"
