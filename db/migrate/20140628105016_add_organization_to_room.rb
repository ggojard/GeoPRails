class AddOrganizationToRoom < ActiveRecord::Migration
  def change
    add_column :rooms, :organization_id, :integer 
  end
end
