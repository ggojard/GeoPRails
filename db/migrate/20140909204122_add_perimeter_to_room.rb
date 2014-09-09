class AddPerimeterToRoom < ActiveRecord::Migration
	def change
		add_column :rooms, :perimeter, :float
	end
end
