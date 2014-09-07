class Company < ActiveRecord::Base

  has_many :buildings
  accepts_nested_attributes_for :buildings, :allow_destroy => true

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :admin_users
  accepts_nested_attributes_for :admin_users, :allow_destroy => true

  # scope :b, -> (buildings)
  
  # def to_builder
  #   Jbuilder.new do |c|
  #     c.(self, :name, :id)
  #     c.url self.url
  #     # c.buildings self.buildings.includes(:floors).collect { |b| b.to_builder.attributes! }
  #     # c.organizations self.organizations.collect { |b| b.to_builder.attributes! }
  #   end
  # end

  # def to_builder_simple
  #   Jbuilder.new do |c|
  #     c.(self, :name, :id)
  #     c.url self.url
  #     c.buildings self.buildings.includes(:floors).collect { |b| b.to_builder_simple.attributes!}
  #     # c.organizations self.organizations.collect { |b| b.to_builder.attributes! }
  #   end
  # end

  def url
    '/companies/%d' % self.id.to_s
  end

  # default_scope {order(:name)}
end
