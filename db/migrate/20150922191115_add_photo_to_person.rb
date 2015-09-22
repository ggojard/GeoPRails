class AddPhotoToPerson < ActiveRecord::Migration
  def change
      add_column :people, :photo, :string
  end
end
