class DropCompanyImages < ActiveRecord::Migration
  def change
    drop_table :company_images
  end
end
