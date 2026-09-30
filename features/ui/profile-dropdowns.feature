@ui @profile @dropdown @session:standard
Feature: Profile preferences - native and custom dropdowns
  The user starts ALREADY LOGGED IN (tag @session:standard loads a saved storage state).
  Country is a native <select>; Language is a custom dropdown (button + listbox).

  Background:
    Given I am on the profile page

  Scenario: The native country dropdown lists every country
    Then the country dropdown should have the options:
      | Select a country |
      | United Kingdom   |
      | India            |
      | United States    |
      | Australia        |

  Scenario Outline: Select a country from the native dropdown - <country>
    When I select "<country>" from the country dropdown
    Then the country dropdown should show "<country>"

    Examples:
      | country        |
      | United Kingdom |
      | India          |

  Scenario: The custom language dropdown lists every language
    Then the language dropdown should have the options:
      | English |
      | Hindi   |
      | Telugu  |
      | Spanish |

  Scenario Outline: Choose a language from the custom dropdown - <language>
    When I choose "<language>" from the language dropdown
    Then the language dropdown should show "<language>"
    And "<language>" should be marked as selected in the language dropdown

    Examples:
      | language |
      | English  |
      | Telugu   |

  @positive
  Scenario: Save preferences using both dropdowns
    When I select "India" from the country dropdown
    And I choose "Telugu" from the language dropdown
    And I save my preferences
    Then I should see the preferences confirmation "Preferences saved: India, Telugu"

  @negative
  Scenario: Preferences cannot be saved without a country
    When I choose "English" from the language dropdown
    And I save my preferences
    Then I should see the preferences error "Please select a country"

  @negative
  Scenario: Preferences cannot be saved without a language
    When I select "Australia" from the country dropdown
    And I save my preferences
    Then I should see the preferences error "Please select a language"
