ActiveAdmin.register Person do
  menu :parent => "Annuaire"

  show :title => :fullname do |c|

    panel "Informations" do
      attributes_table_for person do
        row "Visualiser" do link_to  "Ouvrir" , c.url end
        row "Identifiant" do c.id end
        row I18n.t('formtastic.labels.person.firstname') do c.firstname end
        row I18n.t('formtastic.labels.person.lastname') do c.lastname end
        # row "Etat" do c.person_state end
        # row "Organisation" do c.organization end
        if !person.person_state.nil?
          row I18n.t('formtastic.labels.person.person_state') do link_to person.person_state.name, [:admin, c.person_state] end
        end

        if !person.organization.nil?
          row I18n.t('formtastic.labels.person.organization') do link_to person.organization.name, [:admin, c.organization] end
        end

        row "Email" do c.email end
        row "Matricule" do c.person_code end
        row "Badge" do c.badge_number end
        row "Photo" do image_tag(c.photo.url(:thumbnail)) end
        row I18n.t('formtastic.labels.person.title') do c.title end
      end
    end

    panel "Inventaire" do
      attributes_table_for person do
        row "Téléphone" do c.telephone end
        row "Téléphone Portable" do c.cellphone end
        row "Référence écran" do c.monitorreference end
        row "Référence ordinateur" do c.computerreference end
      end
    end
    # active_admin_comments

    panel "Affectations" do
      table_for person.affectations.select { |a| !a.room.nil? }  do
        column "Pièces" do |b| link_to b.room.fullname  , admin_room_path(b.room.id) end
        column "Visualiser" do |b| link_to  "Visualiser" , room_path(b.room.id) end
      end
    end
  end


  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.person.firstname'), :firstname
    column I18n.t('formtastic.labels.person.lastname'), :lastname
    column I18n.t('formtastic.labels.person.person_state'), :person_state
    column I18n.t('formtastic.labels.person.organization'), :organization

    actions
  end

  form(:html => { :multipart => true }) do |f|

    f.inputs "Details" do
      f.input :firstname
      f.input :lastname
      f.input :telephone
      f.input :cellphone
      f.input :person_state
      f.input :organization
      f.input :email
      f.input :person_code
      f.input :badge_number
      f.input :photo
      f.input :title
    end
    f.inputs "Inventaire" do
      f.input :monitorreference
      f.input :computerreference
    end


    rooms = Room.includes([{:floor=>:building}]).map{|u| [u.fullname, u.id]}
    f.has_many :affectations do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'affectation"
      end
      app_f.input :room, label: "Nom", as: :select, :collection => rooms
    end


    f.actions
  end



  controller do
    def permitted_params
      params.permit!
    end
  end
end
