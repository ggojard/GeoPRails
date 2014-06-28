class Organization < ActiveRecord::Base
  belongs_to :organization_type
  belongs_to :organization
  belongs_to :company

  has_many :organizations, :dependent => :destroy
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id, :organization_type, :organization, :company, :color)
      b.url '/organizations/' + self.id.to_s
      b.organizations self.organizations.collect { |o| o.to_builder.attributes! }
    end
  end
end
