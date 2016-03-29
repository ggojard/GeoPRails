ActiveAdmin.register ItemTypeBrand do
  menu :parent => "Inventaire"

# See permitted parameters documentation:
# https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
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
