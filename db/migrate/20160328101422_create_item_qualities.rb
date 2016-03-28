class CreateItemQualities < ActiveRecord::Migration
  def change
    create_table :item_qualities do |t|
      t.string :name
      t.integer :rank
      t.timestamps
    end
  end
end
