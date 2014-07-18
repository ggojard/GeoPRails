class CreateRoomGroundTypes < ActiveRecord::Migration
  def change
    create_table :room_ground_types do |t|
      t.string :name

      t.timestamps
    end
  end
end
