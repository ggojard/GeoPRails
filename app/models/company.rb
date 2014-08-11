class Company < ActiveRecord::Base

  has_many :buildings, :dependent => :destroy
  accepts_nested_attributes_for :buildings, :allow_destroy => true

  has_many :organizations, :dependent => :destroy
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :admin_users
  accepts_nested_attributes_for :admin_users, :allow_destroy => true

  def to_builder
    Jbuilder.new do |c|
      c.(self, :name, :id)
      c.url '/companies/' + self.id.to_s
      c.buildings self.buildings.collect { |b| b.to_builder.attributes! }
      # c.organizations self.organizations.collect { |b| b.to_builder.attributes! }
    end
  end
  # default_scope {order(:name)}
end
