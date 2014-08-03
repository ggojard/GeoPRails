class AddEmailAndNetwork < ActiveRecord::Migration
  def change
    add_column :rooms, :network, :text
    add_column :people, :email, :string
  end
end
