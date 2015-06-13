Feature: Contribute to create company
  In order to create a company
  As a contributor
  I want to create a company

  Scenario: Create Company
    Given I have a company with name "c" and a building with name "b"
    And I am connected with email "pouya@surfy.pro" and password "pouyapouya"
    When I go to the home page
    # Then I should see "b"
