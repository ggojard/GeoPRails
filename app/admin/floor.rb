ActiveAdmin.register Floor do
  menu :label => "Etages"

  permit_params :name, :image, :building_id

  index do
    selectable_column
    id_column
    column "Bâtiment", :building
    column "Nom", :name
    column "Niveau", :level
    # column "Image Dimensions", :image_dimensions
    actions
  end

  form :html => { :enctype => "multipart/form-data" } do |f|
    f.inputs "Details" do
      f.input :name, :label => "Nom"
      f.input :building, :label => "Bâtiment", :as => :select, :collection => Building.order(:name).all, :include_blank => false
      f.input :level, :label => "Niveau"
      f.input :image, :required => false, :as => :file
    end
    f.actions
  end

  show do |ad|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir",'/floors/' + ad.id.to_s, {}) end
      row "Nom" do ad.name end
      row "Bâtiment" do  ad.building end
      row "Niveau" do ad.level end
      # "Image Plan",
      row "Plan" do
        image_tag(ad.image.url(:thumb))
      end

      panel "Pièces" do
        table_for floor.rooms do
          column "Nom de la pièce" do |b| link_to b.name, [:admin, b] end
        end
      end

    end
  end

  controller do
    def permitted_params
      params.permit!
    end
  end
end
