ActiveAdmin.register Room do
  menu :label => "Pièces"

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
  #

  index do
    selectable_column
    id_column
    column "Etage", :floor
    column "Nom", :name
    # column "Polyline", :points
    actions
  end


  controller do
    def permitted_params
      params.permit!
    end
  end
end
