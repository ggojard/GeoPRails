ActiveAdmin.register Company do

  show do |c|
    attributes_table do
      row I18n.t('formtastic.labels.company.name') do c.name end
    end

    panel I18n.t('activerecord.models.building.other') do
      table_for c.buildings do
        column I18n.t('formtastic.labels.building.name') do |b| link_to b.name ,[:admin, b] end
      end
    end
  end


  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.company.name'), :name
    actions
  end


  form do |company|
    company.inputs  do
      company.input :name
    end

    company.has_many :buildings do |b|
      b.inputs I18n.t('activerecord.models.building.other') do
        if !b.object.nil?
          b.input :name
        end
        b.actions :only => [:create, :edit, :destroy, :remove]
      end
    end
    company.actions
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
  #
  controller do
    def scoped_collection
      Company.includes(:buildings)
    end
    def permitted_params
      params.permit!
    end
  end

end
