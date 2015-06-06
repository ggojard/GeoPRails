class AddNumberOfBadgeToPerson < ActiveRecord::Migration
  def change
    add_column :people, :badge_number, :string
  end
end
