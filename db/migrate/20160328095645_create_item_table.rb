class CreateItemTable < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.integer :x
      t.integer :y
      t.references :room, index: true
      t.references :item_quality, index: true
      t.datetime :purchase_date
      t.string :immo_code
      t.timestamps
    end
  end
end
