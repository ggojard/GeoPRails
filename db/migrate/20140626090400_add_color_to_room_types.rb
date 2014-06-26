class AddColorToRoomTypes < ActiveRecord::Migration
  def change
    add_column :room_types, :color, :string
  end
end
