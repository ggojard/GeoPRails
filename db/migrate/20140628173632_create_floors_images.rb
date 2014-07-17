class CreateFloorsImages < ActiveRecord::Migration
  def change
    drop_table :floors_images
    create_table :floors_images do |t|
      t.string :style
      t.integer :floor_id
      t.column :file_contents, :binary, :limit => 10.megabyte
      t.timestamps
    end
  end
end
