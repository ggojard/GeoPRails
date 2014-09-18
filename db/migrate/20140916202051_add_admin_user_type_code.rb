class AddAdminUserTypeCode < ActiveRecord::Migration
  def change
  	add_column :admin_user_types, :code, :string
  end
end
