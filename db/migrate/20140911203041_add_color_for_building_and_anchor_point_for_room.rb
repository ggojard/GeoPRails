class AddColorForBuildingAndAnchorPointForRoom < ActiveRecord::Migration
  def change
	add_column :rooms, :anchor_text_point, :string
	add_column :buildings, :color, :string
  end
end
