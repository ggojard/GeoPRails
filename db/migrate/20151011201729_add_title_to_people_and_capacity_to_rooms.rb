class AddTitleToPeopleAndCapacityToRooms < ActiveRecord::Migration
  def change
    add_column :people, :title, :string
    add_column :rooms, :capacity, :integer
  end
end
