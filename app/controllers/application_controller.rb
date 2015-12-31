class ApplicationController < ActionController::Base
  before_action :current_ability, :set_user_globals, :except => [:logo]
  @@the_user = nil
  # protect_from_forgery

  before_filter do
    resource = controller_name.singularize.to_sym
    method = "#{resource}_params"
    params[resource] &&= send(method) if respond_to?(method, true)
  end

  rescue_from CanCan::AccessDenied do |exception|
    redirect_to (root_path), :alert => exception.message
  end

  def render_404
    render file: "#{Rails.root}/public/404.html", layout: false, status: 404
  end


# def current_ability
#   @current_ability = Rails.cache.fetch("#{current_user.cache_key}::ability") do
#     super
#   end
# end unless Rails.env.development?


  def current_ability
    @@the_user = current_admin_user
    @current_ability ||= ::Ability.new(current_admin_user)
  end

  def authenticate_admin_user_with_cancan!
    puts 'Check User Code (%s).' % @global_user_type
    authenticate_admin_user!
    unless @global_user_type == 'ADMIN' || @global_user_type == 'WRITE'
      flash[:alert] = "You are not authorized to access this resource!"
      redirect_to root_path
    end
  end

  def self.value
    ids = []
    if !@@the_user.nil?
      puts 'self.value the user is (%s)' % @@the_user.email
      c = "id IN (%s)" % $arm[@@the_user.id].buildings_id.join(",")
      puts "condition is then (%s)" % c
      return
    end
    return ''
  end

  private

  def get_global_company
    if !current_admin_user.nil?
      arm = $arm[current_admin_user.id]
      u_arm_buildings_id = arm.buildings_id;
      # puts 'get_global_company'
      # puts u_arm_buildings_id
      # $global_company = Company.includes(:buildings => :floors).find_by_id(current_admin_user.company_id)
      arm.company ||= ::Company.includes(:buildings=> :floors ).where(buildings: {id: u_arm_buildings_id}).order("buildings.name, floors.level").find_by_id(current_admin_user.company_id)
      return arm.company
    end
  end

  def get_global_company_json
    @global_company.as_json({:methods => [:url, :logo_small], :include => {:buildings => {:include => :floors, :methods => [:url]}}})
  end

  def set_user_globals
    puts "Load User Globals"
    @global_company = get_global_company
    set_user_type_for_current_user
    gon.userType = @global_user_type
    gon.company = get_global_company_json
    gon.i18n ||= I18n.t('formtastic.labels');
  end

  def set_user_type_for_current_user
    if !current_admin_user.nil?
      user_id = current_admin_user.id
      @global_user_type = $arm[user_id].user_type
    else
      @global_user_type = 'READ'
    end
  end
end
