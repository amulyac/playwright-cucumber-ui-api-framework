@ui @storage
Feature: Reuse a logged-in session with a storage state file
  A storage state file stores the cookies of a logged-in browser.
  Loading it into a new browser context skips the login screen.

  Scenario: Save the session after a UI login and reuse it in a new browser
    Given I am on the login page
    When I log in as the "standard" user
    Then I should be on the profile page
    When I save the browser session to "standard-from-ui.json"
    Then the storage state file "standard-from-ui.json" should contain the session cookie
    When I open a new browser using the saved session "standard-from-ui.json"
    Then the new browser should show the profile page without logging in

  @session:standard
  Scenario: A standard user starts already logged in
    Given I am on the profile page
    Then I should see the welcome message "Welcome, Existing"
    And the admin panel should not be visible

  @session:admin
  Scenario: An admin starts already logged in
    Given I am on the profile page
    Then I should see the welcome message "Welcome, Admin"
    And the admin panel should be visible

  @negative
  Scenario: Without a saved session the profile page redirects to login
    When I try to open the profile page
    Then I should be redirected to the login page
