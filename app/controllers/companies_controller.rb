class CompaniesController < GeopController
  before_action :set_company, only: [:show]

  def index
    @c = Company.find(current_admin_user.company_id)
    redirect_to company_url(@c)
  end

  def show
    @json = @company.to_builder.target!.to_json
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_company
    @company = Company.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  # def home_params
  #   params[:home]
  # end
end
