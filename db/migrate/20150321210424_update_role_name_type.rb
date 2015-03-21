class UpdateRoleNameType < ActiveRecord::Migration
  def change

    remove_column :admin_user_roles, :name
    add_column :admin_user_roles, :name, :string

  end
end
