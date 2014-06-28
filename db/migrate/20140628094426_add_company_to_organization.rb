class AddCompanyToOrganization < ActiveRecord::Migration
  def change
    add_column :organizations, :company_id, :integer 
  end
end
