ActiveAdmin.register Building do
  show do |f|
    attributes_table do
      row "Nom" do f.name end
    end

    panel "Etages" do
      table_for building.floors do
        column "Nom" do |b| link_to b.name, [:admin, b] end
      end
    end
  end



  form do |f|
    f.inputs "Details" do
      f.input :name
    end

    f.has_many :floors do |b|
      b.inputs "Etages" do
        if !b.object.nil?
          b.input :name
        end
        b.actions :only => [:create, :edit, :destroy, :remove]
      end
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
  # permit_params do
  #  permitted = [:permitted, :attributes]
  #  permitted << :other if resource.something?
  #  permitted
  # end
  controller do
    def scoped_collection
      Building.includes(:floors)
    end
    def permitted_params
      params.permit!
    end
  end

end
