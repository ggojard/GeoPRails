class GeopController < ApplicationController
  # load_and_authorize_resource
  before_action :authenticate_admin_user!, :unless => :devise_controller?
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  def authorize_read? o
    return @current_ability.can?(:read, o)
  end

  def render_json_404
    return render :json => {"error"=> "not_found", "code" => 404}, :status => :not_found
  end

  def self.PlatformName
    if ENV['SURFY_NAME'].nil?
      ENV['SURFY_NAME'] = 'surfy'
    end
    ENV['SURFY_NAME']
  end


end
