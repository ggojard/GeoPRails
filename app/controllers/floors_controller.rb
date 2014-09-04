class FloorsController < GeopController
  before_action :set, only: [:show, :edit, :update, :show_json]
  # before_action :floor_params, only: [:update]

  def show

    floor = Floor.includes(:rooms => [:room_type, :evacuation_zone, :organization, :room_ground_type, :affectations]).find_by_id(params[:id])
    # gon.floor = @floor.to_builder.attributes!
    gon.floor = floor.to_json(:include => {:rooms => {:include => [:room_type, :evacuation_zone, :organization, :room_ground_type, :affectations]}})
    gon.mode = 'show'
  end


  def show_json
    if !@floor.nil?
      render json:@floor.to_builder.target!
    else
      render json: {"error"=>"floor is nil"}
    end
  end

  def edit
    if !@floor.nil?
      gon.floor = @floor.to_builder.attributes!
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
    # @floor = Floor.find_by_id(params[:id])
  end

  def floor_params
    params.require(:floor).permit(:map_scale_x1, :map_scale_y1, :map_scale_x2, :map_scale_y2, :map_scale_length)
  end


end
