ActiveAdmin.register Building do
  # menu :label => "Bâtiments"

  show do |f|
    attributes_table do
      row I18n.t('formtastic.labels.building.name') do f.name end
    end

    panel I18n.t('activerecord.models.floor.other') do
      table_for building.floors do
        column I18n.t('formtastic.labels.floor.name') do |b| link_to b.name, [:admin, b] end
      end
    end
  end

  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.building.name'), :name
    column I18n.t('formtastic.labels.building.company'),:company
    actions
  end


  form do |f|
    f.inputs  do
      f.input :name
      f.input :company
    end

    f.has_many :floors do |b|
      b.inputs I18n.t('activerecord.models.floor.other') do
        if b.object.present?
          b.input :name
          b.input :level
        end
        b.actions 
      end
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
  controller do
    def scoped_collection
      Building.includes(:floors)
    end
    def permitted_params
      params.permit!
    end
  end

end
