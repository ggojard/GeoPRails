class CreateRooms < ActiveRecord::Migration
  def change
    create_table :rooms do |t|
      t.string :name
      t.references :room_type, index: true
      t.references :floor, index: true
      t.timestamps
    end
  end
end
