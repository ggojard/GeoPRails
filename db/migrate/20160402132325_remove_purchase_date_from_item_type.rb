class RemovePurchaseDateFromItemType < ActiveRecord::Migration
  def change
    remove_column :item_types, :purchase_date
  end
end
