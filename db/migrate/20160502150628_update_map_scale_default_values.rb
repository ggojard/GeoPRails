class UpdateMapScaleDefaultValues < ActiveRecord::Migration

  def up
    change_column_default :floors, :map_scale_x1, 0
    change_column_default :floors, :map_scale_y1, 0
    change_column_default :floors, :map_scale_x2, 50
    change_column_default :floors, :map_scale_y2, 50

    change_column_default :rooms, :area, 0
    change_column_default :rooms, :perimeter, 0
    change_column_default :rooms, :capacity, 0

  end

  def down
  end
end
