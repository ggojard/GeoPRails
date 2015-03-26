ActiveAdmin.register AdminUserRoleToBuilding do
  menu :parent => "Administration"


  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.admin_user_role_to_building.admin_user_role'), :admin_user_role
    column I18n.t('formtastic.labels.admin_user_role_to_building.building'), :building
    actions
  end

  controller do
    def permitted_params
      params.permit!
    end
  end

  
end
