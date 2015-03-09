class AddAnalyticsCodeToCompany < ActiveRecord::Migration
  def change
    add_column :companies, :analytics_code, :string
  end
end
