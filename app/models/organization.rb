class Organization < ActiveRecord::Base
  belongs_to :organization_type
  belongs_to :organization
  belongs_to :company

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :rooms
  accepts_nested_attributes_for :rooms, :allow_destroy => true


  def to_builder_search
    Jbuilder.new do |b|
      b.(self, :name)
      b.url '/organizations/' +  self.id.to_s
    end
  end

  def url
    '/organizations/%d' %  self.id
  end

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id, :organization_type, :organization, :company, :color, :url)
      b.url self.url
      # b.organizations self.organizations.collect { |o| o.to_builder.attributes! }
      # b.rooms self.rooms.collect { |o| o.to_builder_no_organization.attributes! }
    end
  end
  default_scope {order(:name)}
end
