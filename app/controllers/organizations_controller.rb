class OrganizationsController < GeopController
  before_action :set, only: [:show]

  def show
    @G_Organization = @organizations.to_builder.target!
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @organizations = Organization.find(params[:id])
  end
end