ActiveAdmin.register Floor do
  menu :label => "Etages"

  permit_params :name, :image

  index do
    selectable_column
    column "Bâtiment", :building
    id_column
    column "Nom", :name
    column "Image Dimensions", :image_dimensions
    actions
  end

  form :html => { :enctype => "multipart/form-data" } do |f|
    f.inputs "Details" do
      f.input :name
      f.input :building
      f.input :image, :required => false, :as => :file
    end

    f.actions
  end

  show do |ad|
    attributes_table do
      row "Nom" do :name end
      row "Bâtiment" do  :building end
      # "Image Plan",
      row :image do
        image_tag(ad.image.url(:thumb))
      end

    panel "Pièces" do
      table_for floor.rooms do
        column "Nom de la pièce" do |b| link_to b.name, [:admin, b] end
      end
    end



        # if ad.rooms != nil do
        # table_for ad.rooms do

        #   column "Nom" do |b| link_to b.name ,[:admin, b] end
        #   column "Type" do |b| b.room_type.name end
        # end
        # end
      

    end
  end

end
