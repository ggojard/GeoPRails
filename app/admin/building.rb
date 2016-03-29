ActiveAdmin.register Building do
  # menu :label => "Bâtiments"

  show do |building|
    attributes_table do
      row I18n.t('formtastic.labels.building.name') do building.name end
      row I18n.t('formtastic.labels.building.company') do building.company end
      # row :company, label:"a"
    end

    panel I18n.t('activerecord.models.floor.other') do
      table_for building.floors do
        column I18n.t('formtastic.labels.floor.name') do |f| link_to f.name, [:admin, f] end
        column I18n.t('formtastic.labels.floor.level') do |f| f.level end
      end
    end

    panel "Roles Associations" do
      table_for building.admin_user_role_to_buildings do
        column "Roles Utilisateurs" do |user_role|
          if !user_role.admin_user_role.nil?
            link_to user_role.admin_user_role.name, admin_admin_user_role_url(user_role.admin_user_role.id)
          end
        end
      end
    end
  end

  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.building.name'), :name
    column I18n.t('formtastic.labels.building.company'),:company
    column I18n.t('formtastic.labels.building.color'), :color, class: 'color-display'    
    actions
  end


  form do |f|
    f.inputs  do
      f.input :name
      f.input :company
      f.input :color
    end

    f.inputs do 
      # , heading: I18n.t('activerecord.models.floor.other')
      f.has_many :floors do |b|
        b.input :name
        b.input :level
      end
    end

    # f.has_many :floors do |b|
    #   b.inputs I18n.t('activerecord.models.floor.other') do
    #     # if !b.object.nil?
    #       b.input :name
    #       b.input :level
    #     # end
    #     b.actions 
    #   end
    # end
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
  controller do
    def scoped_collection
      Building.includes(:floors)
    end
    def permitted_params
      params.permit!
    end
  end

end
