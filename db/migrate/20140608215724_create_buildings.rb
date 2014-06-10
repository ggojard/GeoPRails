class CreateBuildings < ActiveRecord::Migration
  def change
    create_table :buildings do |t|
      t.string :name
      t.references :Company, index: true

      t.timestamps
    end
  end
end
