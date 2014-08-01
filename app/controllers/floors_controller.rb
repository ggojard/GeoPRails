class FloorsController < GeopController
  before_action :set, only: [:show, :edit, :update, :show_json]
  # before_action :floor_params, only: [:uodate]

  def show
    @json = @floor.to_builder.target!
    @G_Mode = 'show';
  end


  def show_json
    render json:@floor.to_builder.target!
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
    id = params[:id]

    @f = FloorsImage.where(floor_id:id, style: @s)
    response.headers['Cache-Control'] = "public, max-age=#{12.hours.to_i}"
    response.headers['Content-Type'] = 'image/png'
    response.headers['Content-Disposition'] = 'inline'
    render :text => @f[0].file_contents
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
