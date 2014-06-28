class AddColorToOrganization < ActiveRecord::Migration
  def change
    add_column :organizations, :color, :string
  end
end
