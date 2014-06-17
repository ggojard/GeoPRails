class GeopController < ApplicationController
  before_action :set_geop
  private
  def set_geop
    @global_company = Company.find(current_admin_user.company_id)
    @global_company_json = @global_company.to_builder.target!.to_json
  end
end
