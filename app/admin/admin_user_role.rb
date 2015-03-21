ActiveAdmin.register AdminUserRole do
  menu :parent => "Administration"

  

index do
    selectable_column
    column I18n.t('formtastic.labels.admin_user_role.id'), :id
    column I18n.t('formtastic.labels.admin_user_role.name'), :name
    actions
  end

  # See permitted parameters documentation:
  # https://github.com/gregbell/active_admin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # permit_params :list, :of, :attributes, :on, :model
  #
  # or
  #
  controller do
    def permitted_params
      params.permit!
    end
  end
  
end
