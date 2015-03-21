class CreateAdminUserRoles < ActiveRecord::Migration
  def change

    # drop_table :active_admin_roles
    # remove_column :admin_users, :active_admin_role_id

    create_table :admin_user_roles do |t|
      t.text :name
      t.timestamps
    end
    add_column :admin_users, :admin_user_role_id, :integer



  end
end
