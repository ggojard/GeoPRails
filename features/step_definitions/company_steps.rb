Given(/^I have a company with name (.*) and a building with name (.*)$/) do |company_name, building_name|
  c = Company.find_or_create_by(name: company_name)
  b = Building.create({:name => building_name, :company_id => c.id})
end

When(/^I go to the home page$/) do
  visit companies_path
end

Then(/^I should see "(.+)"$/) do |company_name|
  
end
