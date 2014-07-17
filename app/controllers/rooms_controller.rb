class RoomsController < GeopController
  before_action :set_room, only: [:show, :update]

  def index
    @rooms = Room.all
  end
  # GET /rooms/1
  # GET /rooms/1.json
  def show
    # @json = @room.to_builder.target!
    @url = '/floors/' + @room.floor_id.to_s + '/room/' + @room.id.to_s
    
    # render json:{'url' => @url}
    redirect_to @url
  end

  # POST /rooms
  # POST /rooms.json
  def create
    @room = Room.new(room_params)
    # respond_to do |format|
    if @room.save
      render json: @room.to_builder.target!
    else
      format.json { render json: @room.errors, status: :unprocessable_entity }
    end
    # end
  end

  # PATCH/PUT /rooms/1
  # PATCH/PUT /rooms/1.json
  def update
    @room = Room.find(params[:id])
    # respond_to do |format|
    if @room.update_attributes(params.require(:room).permit(:points))
      render json: {}
    else
      render :action => "edit"
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_room
    @room = Room.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def room_params
    params.require(:room).permit(:name, :floor_id, :points)
  end

end
