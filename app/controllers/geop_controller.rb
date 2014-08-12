class GeopController < ApplicationController
  before_action :authenticate_admin_user!, :unless => :devise_controller?
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :set_geop
  private
  def set_geop
    if current_admin_user.present?
      @global_company = Company.find_by_id(current_admin_user.company_id)
      @global_company_json = @global_company.to_builder.target!
      @global_room_types = RoomType.all.to_json
    end
  end
end
