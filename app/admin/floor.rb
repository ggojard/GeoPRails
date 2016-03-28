ActiveAdmin.register Floor do

  permit_params :name, :image, :building_id
  index do
    selectable_column
    id_column
    column I18n.t('activerecord.models.building.one'), :building
    column I18n.t('formtastic.labels.floor.name'), :name
    column I18n.t('formtastic.labels.floor.level'), :level
    actions
  end

  form :html => { :enctype => "multipart/form-data" } do |f|
    f.inputs do
      f.input :name
      f.input :building
      f.input :level
      f.input :image, :required => false, :as => :file
      f.input :background_opacity
      f.input :map_scale_x1
      f.input :map_scale_y1
      f.input :map_scale_x2
      f.input :map_scale_y2
    end
    f.actions
  end

  show do |ad|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir",'/#/floors/' + ad.id.to_s, {}) end
      row I18n.t('formtastic.labels.floor.name') do ad.name end
      row I18n.t('activerecord.models.building.one') do  ad.building end
      row I18n.t('formtastic.labels.floor.level') do ad.level end
      row I18n.t('formtastic.labels.floor.background_opacity') do ad.background_opacity end
      # "Image Plan",
      row "Plan" do
        image_tag('/floors/images/%d?style=thumb' % ad.id)
      end
    end
    panel I18n.t('activerecord.models.room.other') do
      table_for floor.rooms do
        column I18n.t('formtastic.labels.room.name') do |b| link_to b.name, [:admin, b] end
      end
    end

  end

  controller do
    def scoped_collection
        Floor.includes(:building)
    end

    def permitted_params
      params.permit!
    end
  end
end
