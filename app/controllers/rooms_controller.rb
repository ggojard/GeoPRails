class RoomsController < GeopController
  before_action :set_room, only: [:show, :update, :delete]


  def self.selection
    [:room_type, :evacuation_zone, :organization, :room_ground_type, {:affectations => {:person => [:person_state, :organization]} }]
  end
  def self.json_selection
    {:rooms => {:methods =>:area_unit, :include => [:room_type, :evacuation_zone, :organization, :room_ground_type, {:affectations => {:include =>{:person =>{:methods => PeopleController.json_methods, :include => [:person_state, {:organization => {:methods => [:url]}}]}} }}]}}
  end


  def index
    @rooms = Room.all
  end
  # GET /rooms/1
  # GET /rooms/1.json
  def show
    @url = '/floors/' + @room.floor_id.to_s + '#' + @room.id.to_s
    redirect_to @url
  end

  def delete
    @room.delete
    render json: {'status' => 'OK'}
  end

  # POST /rooms
  # POST /rooms.json
  def create
    @room = Room.new(room_params)
    if @room.save
      render json: @room.to_builder.target!
    else
      format.json { render json: @room.errors, status: :unprocessable_entity }
    end
  end

  # PATCH/PUT /rooms/1
  # PATCH/PUT /rooms/1.json
  def update
    if @room.update_attributes(params.require(:room).permit(:points, :area))
      render json: {}
    else
      render :action => "edit"
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_room
    @room = Room.find_by_id(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def room_params
    params.require(:room).permit(:name, :floor_id, :points, :area)
  end

end
