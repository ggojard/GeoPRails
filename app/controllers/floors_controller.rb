class FloorsController < GeopController
  before_action :set, only: [:show, :edit, :update]
  # before_action :floor_params, only: [:uodate]

  def show
    @json = @floor.to_builder.target!
    @G_Mode = 'show';    
  end

  def edit
    @json = @floor.to_builder.target!
    @G_Mode = 'edit';
    render 'show'
  end


  def image
    @s = params[:style]
    if @s == nil
      @s = 'original'
    end
    @f = FloorsImage.where(floor_id:params[:id], style: @s)
    # render json: {a:@f}
    render :text => @f[0].file_contents, :content_type => 'image/png'
  end

  def update
    # @floor = Room.find(params[:id])
    # respond_to do |format|
    if @floor.update_attributes(floor_params)
      render json: {}
    else
      render :action => "show"
    end
  end


  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @floor = Floor.find(params[:id])
    if (params[:room_id])
      @G_Room = Room.find(params[:room_id]).to_builder.target!
    else 
      @G_Room = "{}".to_json
    end

  end

  def floor_params
    params.require(:floor).permit(:map_scale_x1, :map_scale_y1, :map_scale_x2, :map_scale_y2, :map_scale_length)
  end


end
