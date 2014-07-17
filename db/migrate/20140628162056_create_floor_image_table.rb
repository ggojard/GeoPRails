class CreateFloorImageTable < ActiveRecord::Migration
  def change
    create_table :floors_images do |t|
      t.string :style
      t.integer :floor_id
      t.timestamps
    end
  end
end
