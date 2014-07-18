class CreatePersonStates < ActiveRecord::Migration
  def change
    create_table :person_states do |t|
      t.string :name

      t.timestamps
    end
  end
end
