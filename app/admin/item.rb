ActiveAdmin.register Item do

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir", item_path(c.id), {}) end
      row I18n.t('formtastic.labels.item.name') do c.name end
      row I18n.t('formtastic.labels.item.code') do c.code end
      row I18n.t('formtastic.labels.item.description') do c.description end
      row I18n.t('formtastic.labels.item.price') do c.price end
    end
  end


  controller do
    def permitted_params
      params.permit!
    end
  end

end
