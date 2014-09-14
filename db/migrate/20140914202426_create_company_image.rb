class CreateCompanyImage < ActiveRecord::Migration
  def change
    create_table :company_images do |t|
      t.string :style
      t.integer :company_id
      t.column :file_contents, :binary, :limit => 10.megabyte
      t.timestamps
    end
  end
end
