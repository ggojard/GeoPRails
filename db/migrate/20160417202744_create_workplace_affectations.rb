class CreateWorkplaceAffectations < ActiveRecord::Migration
  def change
    create_table :workplace_affectations do |t|
      t.references :person, index: true, foreign_key: true
      t.references :workplace, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
