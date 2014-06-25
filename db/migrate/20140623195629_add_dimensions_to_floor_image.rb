class AddDimensionsToFloorImage < ActiveRecord::Migration
  def change
    add_column :floors, :image_dimensions, :string
  end
end
