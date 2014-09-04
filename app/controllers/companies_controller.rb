class CompaniesController < GeopController
  before_action :set_company, only: [:show]
  

  def index
    if current_admin_user != nil
      # @c = Company.find_by_id(current_admin_user.company_id)
      # redirect_to company_url(@c)
    else
      render 'login/login'
    end
  end

  def show
    gon.organizations = Organization.all
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_company
    # @company = Company.includes(:buildings).find_by_id(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  # def home_params
  #   params[:home]
  # end
end
