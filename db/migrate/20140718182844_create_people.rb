class CreatePeople < ActiveRecord::Migration
  def change
    create_table :people do |t|
      t.string :firstname
      t.string :lastname
      t.string :monitorreference
      t.string :computerreference
      t.string :telephone
      t.string :cellphone

      t.timestamps
    end
  end
end
