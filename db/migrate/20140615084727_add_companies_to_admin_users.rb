class AddCompaniesToAdminUsers < ActiveRecord::Migration
  def change
    add_column :admin_users, :company_id, :integer
  end
end
