class CreateAffectations < ActiveRecord::Migration
  def change
    create_table :affectations do |t|
      t.integer :person_id
      t.integer :room_id

      t.timestamps
    end
  end
end
