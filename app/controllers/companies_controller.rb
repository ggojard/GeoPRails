class CompaniesController < GeopController
  
  def index
    if current_admin_user != nil
      c = Company.find_by_id(current_admin_user.company_id)
      redirect_to company_url(c)
    else
      render 'login/login'
    end
  end

  def show
    gon.organizations = Organization.all.as_json()
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  # def home_params
  #   params[:home]
  # end
end
