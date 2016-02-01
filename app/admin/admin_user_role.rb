ActiveAdmin.register AdminUserRole do
  menu :parent => "Administration"

  

index do
    selectable_column
    column I18n.t('formtastic.labels.admin_user_role.id'), :id
    column I18n.t('formtastic.labels.admin_user_role.name'), :name
    actions
  end

  show do |c|

    # panel I18n.t('formtastic.labels.admin_user_role.reload_rights') do
    #   attributes_table_for admin_user_role do
    #   row I18n.t('formtastic.labels.admin_user_role.reload_rights') do link_to I18n.t('formtastic.labels.admin_user_role.reload_rights'), "/admin/clear_cache", target: 'new' end
    #   end
    # end

    panel "Informations" do
      attributes_table_for admin_user_role do
        row "Identifiant" do c.id end
        row "Nom" do c.name end
      end
    end
    panel "Rôle à Bâtiment" do
      table_for admin_user_role.admin_user_role_to_buildings do
        column "Bâtiment" do |b|
          if !b.building.nil?
            link_to b.building.name, admin_person_url(b.building.id)
          end
        end
        # column "Pièces" do |b| link_to b.room.name + ' < ' + b.room.floor.name + ' < ' + b.room.floor.building.name  , admin_room_path(b.room.id) end
        # column "Nom" do |b| link_to  "Visualiser" , room_path(b.room.id) end
      end
    end
  end

 form do |f|
    f.inputs "Details" do
      f.input :name
    end
    f.has_many :admin_user_role_to_buildings do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'association Rôle à Bâtiment"
      end
      app_f.input :building, label: "Nom", as: :select, :collection => Building.all.map{|u| [u.name, u.id]}
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
  controller do
    def permitted_params
      params.permit!
    end
  end
  
end
