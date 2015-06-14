class GeopController < ApplicationController
  # load_and_authorize_resource
  before_action :authenticate_admin_user!, :unless => :devise_controller?
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
end
