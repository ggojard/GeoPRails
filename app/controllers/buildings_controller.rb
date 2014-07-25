class BuildingsController < GeopController
  before_action :set, only: [:show]

  def show
    @G_Building = @building.to_builder.target!
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @building = Building.find(params[:id])
  end
end
