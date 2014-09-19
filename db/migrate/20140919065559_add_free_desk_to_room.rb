class AddFreeDeskToRoom < ActiveRecord::Migration
  def change
  	add_column :rooms, :free_desk_number, :integer
  end
end
