ActiveAdmin.register AdminUser do
  menu :parent => "Administration"
  permit_params :email, :password, :password_confirmation, :company_id, :username, :admin_user_type_id, :admin_user_role_id

  index do
    selectable_column
    id_column
    column :email
    column :username
    column :current_sign_in_at
    column :sign_in_count
    # column :created_at
    column :company
    column "Type", :admin_user_type
    column "Role", :admin_user_role
    actions
  end

  filter :email
  filter :username
  # filter :current_sign_in_at
  # filter :sign_in_count
  # filter :created_at
  filter :company

  form do |f|
    f.inputs "Admin Details" do
      f.input :email
      f.input :password
      f.input :password_confirmation
      f.input :company
      f.input :username      
      f.input :admin_user_type
      f.input :admin_user_role
    end
    f.actions
  end

end
