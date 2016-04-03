class AddItemTypeToItem < ActiveRecord::Migration
  def change
    add_reference :items, :item_type, index: true, foreign_key: true
  end
end
