class FloorsController < GeopController
  before_action :set, only: [:show, :edit, :update, :show_json]
  # before_action :floor_params, only: [:update]

  def show
    gon.floor = @floor.to_builder.attributes!
    gon.mode = 'show'
  end


  def show_json
    render json:@floor.to_builder.target!
  end

  def edit
    gon.floor = @floor.to_builder.attributes!
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
    @floor = Floor.find_by_id(params[:id])
    # if (params[:room_id])
      # gon.roomId = params[:room_id].to_i
    #   gon.room = Room.find_by_id(params[:room_id]).to_builder.attributes!
    # else
    #   gon.room = "{}".to_json
    # end

  end

  def floor_params
    params.require(:floor).permit(:map_scale_x1, :map_scale_y1, :map_scale_x2, :map_scale_y2, :map_scale_length)
  end


end
