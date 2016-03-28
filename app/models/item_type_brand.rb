class ItemTypeBrand < ActiveRecord::Base
  has_many :item_types
  accepts_nested_attributes_for :item_types, :allow_destroy => true
end
