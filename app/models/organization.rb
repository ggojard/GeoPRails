class Organization < ActiveRecord::Base
  belongs_to :organization_type
  belongs_to :organization
  belongs_to :company

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :people
  accepts_nested_attributes_for :people, :allow_destroy => true

  has_many :rooms
  accepts_nested_attributes_for :rooms, :allow_destroy => true

  def url
    '/#/organizations/%d' %  self.id
  end

  default_scope {order(:name)}
end
