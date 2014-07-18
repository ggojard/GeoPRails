class AddPersonLinks < ActiveRecord::Migration
  def change
    add_column :people, :person_state_id, :integer
    add_column :people, :organization_id, :integer
    add_column :people, :room_id, :integer
  end
end
