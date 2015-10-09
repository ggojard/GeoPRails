class RemoveImageFromCompany < ActiveRecord::Migration
  def change
    remove_column :companies, :image_file_name
    remove_column :companies, :image_content_type
    remove_column :companies, :image_file_size
    remove_column :companies, :image_updated_at
  end
end
