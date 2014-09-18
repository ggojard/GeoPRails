class CorrectAdminUsers < ActiveRecord::Migration
  def change
  	remove_column :admin_user_types, :admin_user_type_id
  	add_column :admin_users, :admin_user_type_id, :integer
  end
end
