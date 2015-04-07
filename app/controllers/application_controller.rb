class ApplicationController < ActionController::Base
  before_action :set_user_code

  # protect_from_forgery

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to (root_path), :alert => exception.message
  end


  def current_ability
    @current_ability ||= Ability.new(current_admin_user)
  end


  def authenticate_admin_user_with_cancan!
    puts 'Check User Code %s ' % @global_user_type
    authenticate_admin_user!
    unless @global_user_type == 'ADMIN' || @global_user_type == 'WRITE'
      flash[:alert] = "You are not authorized to access this resource!"
      redirect_to root_path
    end
  end


 private

  def set_user_code
    if !current_admin_user.nil?
      @global_user_type = 'READ';
      if !current_admin_user.admin_user_type.nil?
        @global_user_type = current_admin_user.admin_user_type.code
      end
      if current_admin_user.email == "admin@example.com"
        @global_user_type = 'ADMIN'
      end
    end
  end


end
