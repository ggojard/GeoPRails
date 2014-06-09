class CreateFloors < ActiveRecord::Migration
  def change
    create_table :floors do |t|
      t.string :name
      t.references :building, index: true

      t.timestamps
    end
  end
end
