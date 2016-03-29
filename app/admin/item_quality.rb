ActiveAdmin.register ItemQuality do
  menu :parent => "Inventaire"

  index do
    selectable_column
    id_column
    # column I18n.t('activerecord.models.building.one'), :building
    column I18n.t('formtastic.labels.item_quality.name'), :name
    column I18n.t('formtastic.labels.item_quality.rank'), :rank
    actions
  end

# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
# permit_params :list, :of, :attributes, :on, :model
#
# or
#
# permit_params do
#   permitted = [:permitted, :attributes]
#   permitted << :other if params[:action] == 'create' && current_user.admin?
#   permitted
# end
  controller do
    def permitted_params
      params.permit!
    end
  end

end
