ActiveAdmin.register Organization do

  permit_params :name, :organization_id, :organization_type_id, :company_id, :color

  show do |c|
    attributes_table do
      row "Nom" do c.name end
      row "Couleur" do c.color end
      row "Organisation Père" do c.organization end
      row "Type" do c.organization_type end
      row "Entreprise" do c.company end
    end
  end
  
  index do
    selectable_column
    id_column
    column "Nom", :name
    column "Couleur", :color, class: 'color-display'
    column "Organisation Père", :organization
    column "Type", :organization_type
    column "Entreprise", :company
    actions
  end

  form do |f|
    f.inputs  do
      f.input :name 
      f.input :color, input_html: { class: 'colorpicker' }
      f.input :organization
      f.input :organization_type
      f.input :company
    end
    f.actions
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

end
