class CreateAdminUserType < ActiveRecord::Migration
  def change
    create_table :admin_user_types do |t|
      t.integer :admin_user_type_id
      t.string :name
      t.timestamps
    end
    add_column :admin_users, :admin_user_type_id,  :integer
  end
end
