class ItemQuality < ActiveRecord::Base
  default_scope {order(:rank)}

  has_many :items
  # accepts_nested_attributes_for :items
end
