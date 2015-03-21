class CreateAdminUserRoleToBuildings < ActiveRecord::Migration
  def change
    create_table :admin_user_role_to_buildings do |t|
      t.integer :admin_user_role_id
      t.integer :building_id

      t.timestamps
    end
  end
end
