ActiveAdmin.register Item do
  menu :parent => "Inventaire"

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir", c.url, {}) end
      row I18n.t('formtastic.labels.item.immo_code') do c.immo_code end
      if !c.item_type.nil?
        row I18n.t('formtastic.labels.item.item_type') do link_to c.item_type.name, [:admin, c.item_type] end
      end
      if !c.room.nil?
        row I18n.t('formtastic.labels.item.room') do link_to c.room.fullname, [:admin, c.room] end
      end
      if !c.item_quality.nil?
        row I18n.t('formtastic.labels.item.item_quality') do link_to c.item_quality.name, [:admin, c.item_quality] end
      end
      row I18n.t('formtastic.labels.item.purchase_date') do c.purchase_date end
    end
  end


  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.item.immo_code'), :immo_code
    column I18n.t('formtastic.labels.item.room'), :room
    column I18n.t('formtastic.labels.item.item_quality'), :item_quality
    column I18n.t('formtastic.labels.item.item_type'), :item_type
    column I18n.t('formtastic.labels.item.purchase_date'), :purchase_date
    actions
  end


  form do |f|
    f.inputs "Details" do
      f.input :room, :as => :select, :collection => Room.rooms_name.all.sort_by{|r| r.reverse_fullname}.map {|r| [r.reverse_fullname, r.id]}, :include_blank => false
      f.input :immo_code
      f.input :item_type
      f.input :item_quality
      f.input :x
      f.input :y
      f.input :purchase_date, :as => :datepicker
    end
    f.actions
  end



  controller do
    def permitted_params
      params.permit!
    end
  end

end
