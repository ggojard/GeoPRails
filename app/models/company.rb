class Company < ActiveRecord::Base

  has_many :buildings
  accepts_nested_attributes_for :buildings, :allow_destroy => true

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :admin_users
  accepts_nested_attributes_for :admin_users, :allow_destroy => true

  def url
    '/companies/%d' % self.id
  end

end
