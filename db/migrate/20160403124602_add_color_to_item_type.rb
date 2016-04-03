class AddColorToItemType < ActiveRecord::Migration
  def change
    add_column :item_types, :color, :string
  end
end
