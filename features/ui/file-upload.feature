@ui @upload @session:standard
Feature: Profile picture upload
  Allowed: PNG, JPG or PDF up to 1 MB.

  Background:
    Given I am on the profile page

  @positive
  Scenario Outline: Upload a supported file - <file>
    When I upload the file "<file>"
    Then I should see the upload confirmation for "<file>"

    Examples:
      | file       |
      | avatar.png |
      | sample.pdf |

  @negative
  Scenario: Reject an unsupported file type
    When I upload the file "notes.txt"
    Then I should see the upload error "Only PNG, JPG or PDF files are allowed"

  @negative
  Scenario: Reject a file larger than 1 MB
    When I upload a generated file "large-photo.jpg" of 1500 KB
    Then I should see the upload error "File must be smaller than 1 MB"

  @negative
  Scenario: Reject an empty file
    When I upload a generated file "empty.png" of 0 KB
    Then I should see the upload error "The selected file is empty"
