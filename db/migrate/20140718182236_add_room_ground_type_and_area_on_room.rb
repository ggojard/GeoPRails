class AddRoomGroundTypeAndAreaOnRoom < ActiveRecord::Migration
  def change
    add_column :rooms, :room_ground_type_id, :integer 
    add_column :rooms, :area, :float 
  end
end