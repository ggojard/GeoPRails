ActiveAdmin.register ItemType do
  menu :parent => "Inventaire"

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir", c.url, {}) end
      row I18n.t('formtastic.labels.item_type.name') do c.name end
      row I18n.t('formtastic.labels.item_type.code') do c.code end
      row I18n.t('formtastic.labels.item_type.description') do c.description end
      row I18n.t('formtastic.labels.item_type.color') do c.color end
      row I18n.t('formtastic.labels.item_type.price') do c.price end
    end
  end

  form do |f|
    f.inputs "Details" do
      f.input :name
      f.input :code
      f.input :description
      f.input :color
      f.input :price
    end
    f.actions
  end

  controller do
    def permitted_params
      params.permit!
    end
  end

end
