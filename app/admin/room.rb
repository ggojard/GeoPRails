ActiveAdmin.register Room do

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir", c.url) end
      row I18n.t('formtastic.labels.room.floor') do link_to c.floor.fullname, admin_floor_path(c.floor.id), {} end
      row I18n.t('formtastic.labels.room.name') do c.name end
      if !c.room_type.nil?
        row I18n.t('formtastic.labels.room.room_type') do link_to c.room_type.name, [:admin, c.room_type] end
      end
      if !c.organization.nil?
        row I18n.t('formtastic.labels.room.organization') do link_to c.organization.name, [:admin, c.organization] end
      end
      # row I18n.t('formtastic.labels.room.organization') do c.organization end
      row I18n.t('formtastic.labels.room.area') do "%d m²" % c.area end
      row I18n.t('formtastic.labels.room.perimeter') do c.perimeter end
      if !c.room_ground_type.nil?
        row I18n.t('formtastic.labels.room.room_ground_type') do link_to c.room_ground_type.name, [:admin, c.room_ground_type] end
      end
      if !c.evacuation_zone.nil?
        row I18n.t('formtastic.labels.room.evacuation_zone') do link_to c.evacuation_zone.name, [:admin, c.evacuation_zone] end
      end
      # row I18n.t('formtastic.labels.room.room_ground_type') do c.room_ground_type end
      # row I18n.t('formtastic.labels.room.evacuation_zone') do c.evacuation_zone end
      row I18n.t('formtastic.labels.room.network') do c.network end
      row I18n.t('formtastic.labels.room.free_desk_number') do c.free_desk_number end
      row I18n.t('formtastic.labels.room.capacity') do c.capacity end
    end


    panel "Affectations" do
      table_for room.affectations do
        column "Personnes" do |b|
          if !b.person.nil?
            link_to b.person.fullname, admin_person_url(b.person.id)
          end
        end
      end
    end

    inventories = room.inventories
    if inventories.count > 0
      panel "Inventaire (Type)" do
        table_for inventories do
          column "Item Type" do |b|
            if !b.item_type.nil?
              link_to b.item_type.name, admin_item_url(b.item_type.id)
            end
          end
          column "Code" do |b|
            if !b.item_type.nil?
              b.item_type.code
            end
          end
          column "Quantité" do |b| b.quantity end
        end
      end
    end

    items = room.items
    if items.count > 0
      panel I18n.t('activerecord.models.item.other') do
        table_for items do
          column I18n.t('formtastic.labels.item.immo_code') do |i| link_to i.name, [:admin, i] end
          column I18n.t('formtastic.labels.item.item_type') do |i| i.item_type end
        end
      end
    end
  end


  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.room.floor'), :floor
    column I18n.t('formtastic.labels.room.name'), :name
    column I18n.t('formtastic.labels.room.room_type'), :room_type
    column I18n.t('formtastic.labels.room.organization'), :organization
    column I18n.t('formtastic.labels.room.room_ground_type'), :room_ground_type
    column I18n.t('formtastic.labels.room.area'), :area
    column I18n.t('formtastic.labels.room.perimeter'), :perimeter
    actions
  end

  form do |f|
    f.inputs "Details" do
      # f.input :id, label: "Visualiser", input_html: { class: 'room-link' }
      f.input :floor, :as => :select, :collection => Floor.includes(:building).all.map {|f| [f.fullname, f.id]}, :include_blank => false
      f.input :name
      f.input :room_type
      f.input :organization
      f.input :room_ground_type
      f.input :evacuation_zone
      f.input :free_desk_number
      f.input :network
      f.input :capacity
    end

    f.has_many :affectations do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'affectation"
      end
      app_f.input :person, label: I18n.t('formtastic.labels.person.name'), as: :select, :collection => Person.all.map{|u| [u.fullname, u.id]}
    end

    f.has_many :inventories do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'item"
      end
      app_f.input :item_type, label: I18n.t('formtastic.labels.item_type.name'), as: :select, :collection => ItemType.all.map{|u| ["#{u.name}", u.id]}
      app_f.input :quantity, label: I18n.t('formtastic.labels.inventory.quantity')
    end


    f.inputs do
      # , heading: I18n.t('activerecord.models.floor.other')
      f.has_many :items do |b|
        b.input :immo_code
        # b.input :item_type, as: :select, :collection => ItemType.all
      end
    end


    # f.has_many :people do |b|
    #   b.inputs "Affectations" do
    #     if !b.object.nil?
    #       b.input :firstname
    #       b.input :lastname
    #     end
    #     b.actions
    #   end
    # end

    # f.inputs "Géométrie" do
    #   f.input :points, label: "Points"
    # end

    f.actions
  end



  controller do
    def scoped_collection
      Room.includes([:floor, :room_type, :room_ground_type, :organization, :affectations => :person, :inventories => :item_type])
    end
    def permitted_params
      params.permit!
    end
  end
end
