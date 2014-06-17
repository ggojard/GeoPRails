class FloorsController < GeopController
  before_action :set, only: [:show]

  def show
    @json = @floor.to_builder.target!.to_json
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @floor = Floor.find(params[:id])
  end

end
