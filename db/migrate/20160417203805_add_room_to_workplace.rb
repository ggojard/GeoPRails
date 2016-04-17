class AddRoomToWorkplace < ActiveRecord::Migration
  def change
    add_column :workplaces, :room_id, :integer, :index => true, :foreign_key => true, references: :rooms
  end
end
