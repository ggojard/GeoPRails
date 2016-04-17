class AddWorkplaceNameToAffectation < ActiveRecord::Migration
  def change
    add_column :affectations, :workplace_name, :string
  end
end
