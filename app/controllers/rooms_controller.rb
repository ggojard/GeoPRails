class RoomsController < GeopController
  before_action :set_room, only: [:show, :update, :delete]
  # before_action :room_params, only: [:create]

  def self.selection
    [:room_type, :evacuation_zone, {:organization => [{:organization => :organizations}, :organizations]}, :room_ground_type, {:affectations => {:person => [:person_state, :organization]} , :inventories => :item}]
  end
  def self.json_selection
    {:rooms => RoomsController.json_single_selection}
  end

  def self.json_single_selection
    {:include => [{:inventories => {:include => :item}}, :room_type, :evacuation_zone, {:organization => {:include => [{:organization => {:include => :organizations}}, :organizations]}}, :room_ground_type, { :affectations => {:include =>{:person =>{:methods => PeopleController.json_methods, :include => [:person_state, {:organization => {:methods => [:url]}}]}} }}]}
  end

  def index
    @rooms = Room.all
  end
  # GET /rooms/1
  # GET /rooms/1.json
  def show
    if !@room.nil?
      redirect_to '/floors/%d#%d' % [@room.floor_id, @room.id]
    else
      redirect_to '/'
    end

  end

  def delete
    @room.delete
    render json: {'status' => 'OK'}
  end

  # POST /rooms
  # POST /rooms.json
  def create
    new_room = Room.new(room_params)
    if new_room.save
      room = Room.includes(RoomsController.selection).find_by_id(new_room.id)
      render json: room.as_json(RoomsController.json_single_selection)
    else
      format.json { render json: new_room.errors, status: :unprocessable_entity }
    end
  end

  # PATCH/PUT /rooms/1
  # PATCH/PUT /rooms/1.json
  # params.require(:room).permit(:points, :area, :perimeter, :anchor_text_point)
  def update
    if @room.update_attributes(room_params)
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
    params.require(:room).permit(:name, :floor_id, :points, :area, :perimeter, :anchor_text_point)
  end

end
