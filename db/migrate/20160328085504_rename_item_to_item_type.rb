class RenameItemToItemType < ActiveRecord::Migration
  def change
    rename_table :items, :item_types
  end
end
