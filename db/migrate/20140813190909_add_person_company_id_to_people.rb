class AddPersonCompanyIdToPeople < ActiveRecord::Migration
  def change
    add_column :people, :person_code, :string
  end
end
