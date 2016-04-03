class UpdateItemColumnNameInInventories < ActiveRecord::Migration
  def change
    rename_column :inventories, :item_id, :item_type_id
  end
end
