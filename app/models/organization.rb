class Organization < ActiveRecord::Base
  require 'geop_libs'

  after_commit :delete_references_cache
  after_destroy :delete_references_cache
  after_create :delete_references_cache

  def delete_references_cache
    GeoPLibs.delete_references_cache
  end

  def color_rgba_with_opacity
    GeoPLibs.color_rgba_with_opacity self.color
  end

  default_scope {order(:name)}

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
end
