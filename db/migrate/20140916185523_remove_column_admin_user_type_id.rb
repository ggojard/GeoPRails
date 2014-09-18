class RemoveColumnAdminUserTypeId < ActiveRecord::Migration
  def change
  	remove_column :admin_users,:admin_user_type_id
  end
end
