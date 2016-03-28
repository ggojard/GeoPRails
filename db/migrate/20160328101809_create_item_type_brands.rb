class CreateItemTypeBrands < ActiveRecord::Migration
  def change
    add_column :item_types, :item_type_brand_id, :integer
    create_table :item_type_brands do |t|
      t.string :name
      t.timestamps
    end
  end
end
