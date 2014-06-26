class BuildingsController < GeopController
  before_action :set, only: [:show]

  def show
    @json = @buildings.to_builder.target!
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @buildings = Building.find(params[:id])
  end
end
