ActiveAdmin.register Affectation do

  

  index do
    selectable_column
    id_column
    column I18n.t('formtastic.labels.affectation.person'), :person
    column I18n.t('formtastic.labels.affectation.room'), :room
    actions
  end


  controller do
    def permitted_params
      params.permit!
    end
  end

end
