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

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir",'/rooms/' + c.id.to_s, {}) end
      row "Etage" do c.floor end
      row "Nom" do c.name end
      row "Type" do c.room_type end
      row "Organisation" do c.organization end
      row "Aire" do c.area.to_s + ' m²' end
      row "Nature des sols" do c.room_ground_type end
    end
  end


  index do
    selectable_column
    id_column
    column "Etage", :floor
    column "Nom", :name
    column "Type", :room_type
    column "Organisation", :organization
    column "Nature des sol", :room_ground_type
    actions
  end

  form do |f|
    f.inputs "Details" do
      f.input :id, label: "Visualiser", input_html: { class: 'room-link' }
      f.input :floor, label: "Etage"
      f.input :name , label: "Nom"
      f.input :room_type, label: "Type"
      f.input :organization, label: "Organisation"
      f.input :room_ground_type, label: "Nature des sol"
    end
    f.inputs "Géométrie" do
      f.input :points, label: "Points"
    end

    f.actions
  end



  controller do
    def permitted_params
      params.permit!
    end
  end
end
