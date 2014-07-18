class AddColorToRoomGroundType < ActiveRecord::Migration
  def change
    add_column :room_ground_types, :color, :string
  end
end
