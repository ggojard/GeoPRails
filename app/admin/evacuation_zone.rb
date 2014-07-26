ActiveAdmin.register EvacuationZone do

  menu :parent => "Types", :label => "Zones d'évacuations"


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
      row "Nom" do c.name end
      row "Couleur" do c.color end
    end
  end
  #
  index do
    selectable_column
    id_column
    column "Nom", :name
    column "Couleur", :color, class: 'color-display'
    actions
  end

  # f.input :name, input_html: { class: 'colorpicker' }

  form do |f|
    f.inputs "Details" do
      f.input :name , label: "Nom"
      f.input :color, input_html: { class: 'colorpicker' }, label: "Couleur"
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


