ActiveAdmin.register Company do
  # authorize_resource
  # include ActiveAdminCanCan

  permit_params :name, :image

  show do |c|
    attributes_table do
      row I18n.t('formtastic.labels.company.name') do c.name end
      row I18n.t('formtastic.labels.company.analytics_code') do c.analytics_code end

      row "Logo" do
        image_tag(c.image.url(:thumb))
      end
    end
    panel I18n.t('activerecord.models.building.other') do      
      table_for c.buildings.select{|b| can? :read, b}  do
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

  form :html => { :enctype => "multipart/form-data" } do |company|
    company.inputs  do
      company.input :name
      company.input :image, :required => false, :as => :file
      company.input :analytics_code
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

  controller do

    # def b1
    #   self.buildings
    # end

    # def scoped_collection
    #   Company.includes(:buildings)
    # end
    def permitted_params
      params.permit!
    end
  end

end
