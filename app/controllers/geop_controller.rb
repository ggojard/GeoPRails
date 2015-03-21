class GeopController < ApplicationController
  before_action :authenticate_admin_user!, :unless => :devise_controller?
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :set_geop

  private

  def set_geop
    gon.userType = @global_user_type
    if !current_admin_user.nil?
      @global_company = Company.includes(:buildings => :floors).find_by_id(current_admin_user.company_id)
      if !@global_company.nil?
        gon.company = @global_company.as_json({:methods => [:url], :include => {:buildings => {:include => :floors, :methods => [:url]}}})
      end
      gon.i18n = I18n.t('formtastic.labels');
    end
  end
end
