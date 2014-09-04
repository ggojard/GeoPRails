class GeopController < ApplicationController
  before_action :authenticate_admin_user!, :unless => :devise_controller?
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :set_geop
  private
  def set_geop
    if !current_admin_user.nil?
      global_company = Company.includes(:buildings => :floors).find_by_id(current_admin_user.company_id)
      # global_company = Company.includes(:buildings => {:floors => {:rooms => [:room_type, :evacuation_zone, :organization, :room_ground_type]} }).find_by_id(current_admin_user.company_id)
      if !global_company.nil?
        # gon.company = global_company.to_json(:include => {:buildings => {:include => {:floors => {:include => {:rooms => {:include => [:room_type, :evacuation_zone, :organization, :room_ground_type]}}}}}})
        gon.company = global_company.to_json(:include => {:buildings => {:include => :floors}})
      end
      gon.i18n = I18n.t('formtastic.labels');
    end
  end
end
