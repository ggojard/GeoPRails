class Inventory < ActiveRecord::Base
  belongs_to :room
  belongs_to :item_type
end

