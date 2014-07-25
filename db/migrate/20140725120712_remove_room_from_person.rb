class RemoveRoomFromPerson < ActiveRecord::Migration
  def change
    remove_column :people, :room_id
  end
end
