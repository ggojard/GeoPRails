ActiveAdmin.register Workplace do
  menu false
  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # permit_params :list, :of, :attributes, :on, :model
  #
  # or
  #
  # permit_params do
  #   permitted = [:permitted, :attributes]
  #   permitted << :other if params[:action] == 'create' && current_user.admin?
  #   permitted
  # end

  show do |c|

    attributes_table do
      row I18n.t('formtastic.labels.workplace.name') do c.name end
      if !c.room.nil?
        row I18n.t('formtastic.labels.workplace.room') do link_to c.room.fullname, [:admin, c.room] end
      end
    end

    panel "Affectations" do
      table_for c.workplace_affectations do
        column "Personnes" do |b|
          if !b.person.nil?
            link_to b.person.fullname, admin_person_url(b.person.id)
          end
        end
      end
    end
  end

  form do |f|
    f.inputs  do
      f.input :name
      f.input :room, :as => :select, :collection => Room.rooms_name.all.sort_by{|r| r.reverse_fullname}.map {|r| [r.reverse_fullname, r.id]}, :include_blank => false
    end

    f.has_many :workplace_affectations do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'affectation"
      end
      app_f.input :person, label: I18n.t('formtastic.labels.person.name'), as: :select, :collection => Person.all.map{|u| [u.fullname, u.id]}
    end

    # f.inputs do
    #   # , heading: I18n.t('activerecord.models.floor.other')
    #   f.has_many :floors do |b|
    #     b.input :name
    #     b.input :level
    #   end
    # end
    f.actions
  end



  controller do
    def permitted_params
      params.permit!
    end
  end

end
