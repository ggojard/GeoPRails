class AddPurchaseDateToItem < ActiveRecord::Migration
  def change
    add_column :items, :purchase_date, :date
  end
end
