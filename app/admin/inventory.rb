ActiveAdmin.register Inventory do
  menu :parent => "Inventaire"

  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.inventory.item'), :item_type
    column I18n.t('formtastic.labels.inventory.room'), :room
    actions
  end

  controller do
    def permitted_params
      params.permit!
    end
  end

  
end
