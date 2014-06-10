class Organization < ActiveRecord::Base
  # belongs_to :organization_type
  belongs_to :organization
  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true
end
