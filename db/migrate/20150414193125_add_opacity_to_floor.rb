class AddOpacityToFloor < ActiveRecord::Migration
  def change
    add_column :floors, :background_opacity, :float, :default => 0.25
  end
end
