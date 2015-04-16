class AddFreeDeskToRoom < ActiveRecord::Migration
  def change
  	add_column :rooms, :free_desk_number, :integer, :default => 0
  end
end
