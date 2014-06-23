class UpdateMapScaleLengthType < ActiveRecord::Migration
  def change
    change_column :floors, :map_scale_length, :float
  end
end
