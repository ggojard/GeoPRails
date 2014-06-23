ActiveAdmin.register Floor do
  menu :label => "Etages"

  permit_params :name, :image

  index do
    selectable_column
    column "Bâtiment", :building
    id_column
    column "Nom", :name
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
      row :name
      row :building
      row :image do
        image_tag(ad.image.url(:thumb))
      end
      # Will display the image on show object page
    end
  end

end
