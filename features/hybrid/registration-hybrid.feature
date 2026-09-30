@hybrid @registration
Feature: Registration - API and UI together
  Use the API for fast test-data setup, then verify behaviour in the UI

  Scenario: UI rejects an email that was registered through the API
    Given a user has been registered via the API
    And I am on the registration page
    When I register in the UI using the email of the API-registered user
    Then I should see the error "An account with this email already exists" for field "email"
