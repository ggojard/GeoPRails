ActiveAdmin.register Company do
  show do |c|
    attributes_table do
      row "Nom" do c.name end
    end

    panel "Buildings" do
      table_for company.buildings do
        column "Nom" do |b| link_to b.name, [:admin, b] end
        column "Plan" do |b| link_to b.name, [:admin, b] end
      end
    end
  end


  form do |company|
    company.inputs "Details" do
      company.input :name
    end

    company.has_many :buildings do |b|
      b.inputs "Buildings" do
        if !b.object.nil?
          b.input :name
        end
        b.actions :only => [:create, :edit, :destroy, :remove]
      end
    end
    company.actions
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
  #
  controller do
    def scoped_collection
      Company.includes(:buildings)
    end
    def permitted_params
      params.permit!
    end
  end

end
