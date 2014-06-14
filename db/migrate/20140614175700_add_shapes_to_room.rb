class AddShapesToRoom < ActiveRecord::Migration
  def change
    add_column :rooms, :points, :text
  end
end
