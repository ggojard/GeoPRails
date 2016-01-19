ActiveAdmin.register Organization do

  permit_params :name, :organization_id, :organization_type_id, :company_id, :color

  show do |c|
    attributes_table do
      row "Nom" do c.name end
      row "Couleur" do c.color end
      row "Organisation Père" do c.organization end
      row "Type" do c.organization_type end
      row "Entreprise" do c.company end

      if c.organizations.length > 0 
        panel I18n.t('activerecord.models.organization.other') do      
          table_for c.organizations.select{|b| can? :read, b}  do
            column I18n.t('formtastic.labels.organization.name') do |b| link_to b.name ,[:admin, b] end
          end
        end
      end

      if c.people.length > 0 
        panel I18n.t('activerecord.models.person.other') do      
          table_for c.people.select{|b| can? :read, b}  do
            column I18n.t('formtastic.labels.person.fullname') do |b| link_to b.fullname ,[:admin, b] end
          end
        end
      end

      if c.rooms.length > 0 
        panel I18n.t('activerecord.models.room.other') do      
          table_for c.rooms.select{|b| can? :read, b}  do
            column I18n.t('formtastic.labels.room.name') do |b| link_to b.fullname ,[:admin, b] end
          end
        end
      end
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
      f.input :color
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
