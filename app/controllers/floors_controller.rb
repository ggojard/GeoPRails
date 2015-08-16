class FloorsController < GeopController
  before_action :current_ability
  before_action :set, only: [:show, :edit, :update, :show_json]

  def self.selection
    [:building, :rooms => RoomsController.selection]
  end

  def self.json_selection
    [{:building => {:methods => [:url, :fullname]}}, RoomsController.json_selection]
  end

  def show
    if !@current_ability.can?(:read, @floor)
      return render_404
    end
    respond_to do |format|
      format.html {
        gon.floor = @floor.as_json(:include => FloorsController.json_selection, :methods =>[:fullname, :url])
        gon.mode = 'show'
      }
      format.json{
        if !@floor.nil?
          render json: @floor.as_json(:include => FloorsController.json_selection, :methods =>[:fullname, :url])
        else
          render json: {"error"=>"floor is nil"}
        end
      }
    end
  end

  def edit
    if !@floor.nil?
      gon.floor = @floor.as_json(:include => FloorsController.json_selection)
    end
    gon.mode = 'edit'
    render 'show'
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
