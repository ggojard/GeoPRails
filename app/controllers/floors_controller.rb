class FloorsController < GeopController
  before_action :current_ability
  before_action :set, only: [:update]

  def self.selection
    [:building, :rooms => RoomsController.selection]
  end

  def self.json_selection
    {:include => [{:building => {:methods => [:url, :fullname]}}, RoomsController.json_selection], :methods => [:filters, :information]}
  end

  def show
    @floor = Floor.includes(FloorsController.selection).find_by_id(params[:id])
    if !authorize_read? @floor; return render_json_404 end
    render json: @floor.as_json(FloorsController.json_selection)
  end

  def update
    if @floor.update_attributes(floor_params)
      render json: {}
    else
      render :action => "show"
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @floor = Floor.includes(FloorsController.selection).find_by_id(params[:id])
  end

  def floor_params
    params.require(:floor).permit(:map_scale_x1, :map_scale_y1, :map_scale_x2, :map_scale_y2, :map_scale_length)
  end


end
