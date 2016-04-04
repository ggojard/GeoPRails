ActiveAdmin.register Organization do

  permit_params :name, :organization_id, :organization_type_id, :company_id, :color

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir", c.url) end
      row "Nom" do c.name end
      row "Couleur" do c.color end
      if !c.organization.nil?
        row "Organisation Père" do link_to c.organization.name, [:admin, c.organization] end
      end
      if !c.organization_type.nil?
        row I18n.t('formtastic.labels.organization.organization_type')do link_to c.organization_type.name, [:admin, c.organization_type] end
      end
      if !c.company.nil?
        row I18n.t('formtastic.labels.organization.company') do link_to c.company.name, [:admin, c.company] end
      end

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
    column I18n.t('formtastic.labels.organization.name'), :name
    column I18n.t('formtastic.labels.organization.color'), :color, class: 'color-display'
    column I18n.t('formtastic.labels.organization.organization'), :organization
    column I18n.t('formtastic.labels.organization.organization_type'), :organization_type
    column I18n.t('formtastic.labels.organization.company'), :company
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
