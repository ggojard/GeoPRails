class CreateOrganizations < ActiveRecord::Migration
  def change
    create_table :organizations do |t|
      t.string :name
      t.references :organization_type, index: true
      t.references :organization, index: true

      t.timestamps
    end
  end
end
