class AddFloorOrder < ActiveRecord::Migration
  def change
    add_column :floors, :level, :integer
  end
end
