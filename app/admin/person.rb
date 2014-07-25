ActiveAdmin.register Person do
  menu :label => "Personnes"

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

  show :title => :fullname do |c|

    panel "Informations" do
      attributes_table_for person do
        # row "Visualiser" do link_to("Ouvrir",'/people/' + c.id.to_s, {}) end
        row "Identifiant" do c.id end
        row "Prénom" do c.firstname end
        row "Nom" do c.lastname end
        row "Etat" do c.person_state end
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
      attributes_table_for person do
        row "Pièce" do c.room end
        row "Organisation" do c.organization end
      end
    end


  end


  index do
    selectable_column
    id_column
    column "Prénom", :firstname
    column "Nom", :lastname
    column "Etat", :person_state
    column "Pièce", :room
    actions
  end

  form do |f|
    f.inputs "Details" do
      # f.input :id, label: "Visualiser", input_html: { class: 'person-link' }
      f.input :firstname, label: "Prénom"
      f.input :lastname , label: "Nom"
      f.input :telephone, label: "Téléphone"
      f.input :cellphone, label: "Téléphone Portable"
      f.input :person_state, label: "Etat"
    end
    f.inputs "Inventaire" do
      f.input :monitorreference, label: "Référence écran"
      f.input :computerreference, label: "Référence ordinateur"
    end
    f.inputs "Affectations" do
      f.input :room, label: "Pièce"
      f.input :organization, label: "Organisation"
    end

    f.actions
  end



  controller do
    def permitted_params
      params.permit!
    end
  end
end
