





G_user_email = 'pouya@surfy.pro'
G_user_password = 'pouyapouya'

Given(/^I have a company with name "(.*)" and a building with name "(.*)"$/) do |company_name, building_name|
  c = Company.find_or_create_by(name: company_name)
  b = Building.create({:name => building_name, :company_id => c.id})
  password = 'pouyapouya'
  AdminUser.new(:email => G_user_email, :password => G_user_password, :password_confirmation => G_user_password, :company_id => c.id).save!
end

Given(/^I am connected with email "(.*)" and password "(.*)"$/) do |user_email, password|
  visit '/'
  find('#admin_user_email').set(user_email)
  find('#admin_user_password').set(password)
  find('#admin_user_submit_action').find('input').click
end

When(/^I go to the home page$/) do
  visit '/'  
  save_and_open_page
end

# Then(/^I should see "(.+)"$/) do |company_name|
#   puts company_name
#   first_position = page.body.index('b')
#   puts first_position

# end
