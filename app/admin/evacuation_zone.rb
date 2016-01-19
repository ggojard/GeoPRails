ActiveAdmin.register EvacuationZone do

  menu :parent => "Types"


  # See permitted parameters documentation:
  # https://github.com/gregbell/active_admin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # permit_params :list, :of, :attributes, :on, :model
  #
  # or
  #
  # permit_params do
  #  permitted = [:permitted, :attributes]
  #  permitted << :other if resource.something?
  #  permitted
  # end

  show do |c|
    attributes_table do
      row I18n.t('formtastic.labels.evacuation_zone.name') do c.name end
      row I18n.t('formtastic.labels.evacuation_zone.color') do c.color end
    end
  end
  #
  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.evacuation_zone.name') , :name
    column I18n.t('formtastic.labels.evacuation_zone.color') , :color, class: 'color-display'
    actions
  end

  form do |f|
    f.inputs do
      f.input :name 
      f.input :color
    end
    f.actions
  end

  controller do
    def permitted_params
      params.permit!
    end
  end

end



# See permitted parameters documentation:
# https://github.com/gregbell/active_admin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
#
# permit_params :list, :of, :attributes, :on, :model
#
# or
#
# permit_params do
#  permitted = [:permitted, :attributes]
#  permitted << :other if resource.something?
#  permitted
# end


