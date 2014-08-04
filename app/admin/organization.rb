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
    f.inputs "Details" do
      f.input :name , label: "Nom"
      f.input :color, input_html: { class: 'colorpicker' }, label: "Couleur"
      f.input :organization, label: "Organisation Père" , :as => :select, :collection => Organization.order(:name).all, :include_blank => false
      f.input :organization_type,label:  "Type", :as => :select, :collection => OrganizationType.order(:name).all, :include_blank => false
      f.input :company,label:  "Entreprise", :as => :select, :collection => Company.order(:name).all, :include_blank => false
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
