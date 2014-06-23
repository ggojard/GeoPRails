class AddMapScaleToFloor < ActiveRecord::Migration
  def change
    add_column :floors, :map_scale_x1, :integer
    add_column :floors, :map_scale_y1, :integer
    add_column :floors, :map_scale_x2, :integer
    add_column :floors, :map_scale_y2, :integer
    add_column :floors, :map_scale_length, :integer
  end
end
