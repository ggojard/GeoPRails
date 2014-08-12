class OrganizationsController < GeopController
  before_action :set, only: [:show]

  def show
    
    gon.organization = @organization.to_builder.attributes!
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @organization = Organization.find_by_id(params[:id])
  end
end