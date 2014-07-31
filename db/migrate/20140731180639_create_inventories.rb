class CreateInventories < ActiveRecord::Migration
  def change
    create_table :inventories do |t|
      t.integer :room_id
      t.integer :item_id
      t.integer :quantity

      t.timestamps
    end
  end
end
