class ItemsController < ApplicationController
  
  @item_includes = [:item_type, :room, :item_quality]
  def item_as_json
    {:include => @item_includes }
  end

  # POST /rooms
  # POST /rooms.json
  def create
    new_item = Item.new(item_params)
    if new_item.save
      i = Item.includes(@item_includes).find_by_id(new_item.id)
      render json: i.as_json(:include => [:item_type, :room])
    else
      format.json { render json: new_item.errors, status: :unprocessable_entity }
    end
  end

  # PATCH/PUT /items/1
  # PATCH/PUT /items/1.json
  def update
    @item = Item.find_by_id(params[:id])
    if @item.update_attributes(item_params)
      render json: {}
    else
      render :action => "edit"
    end
  end


  def index
  end

  def search_to_add
    @search = params[:q]
    items = Item.includes(@item_includes).where('immo_code like ?', "%#{@search}%")
    render json: items.as_json(item_as_json)
  end

    # Never trust parameters from the scary internet, only allow the white list through.
  def item_params
    params.require(:item).permit(:x, :y, :room_id, :item_type_id)
  end


end
