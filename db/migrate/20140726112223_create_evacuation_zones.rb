class CreateEvacuationZones < ActiveRecord::Migration
  def change
    create_table :evacuation_zones do |t|
      t.string :color
      t.string :name

      t.timestamps
    end

    add_column :rooms, :evacuation_zone_id, :integer

  end
end
