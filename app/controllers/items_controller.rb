class ItemsController < ApplicationController

  def self.item_selection
    [:item_type, {:room => {:floor => :building}}, :item_quality]
  end

  def self.item_as_json
    {:include =>  [:item_type, {:room => {:methods => [:url_with_floor, :fullname]}}, :item_quality], :methods => [:qrcode_url, :url, :fullname] }
  end

  # POST /rooms
  # POST /rooms.json
  def create
    new_item = Item.new(item_params)
    if new_item.save
      i = Item.includes(ItemsController.item_selection).find_by_id(new_item.id)
      render json: i.as_json(ItemsController.item_as_json)
    else
      format.json { render json: new_item.errors, status: :unprocessable_entity }
    end
  end

  def qrcode
    puts 'get qrcode %d' % params[:id]
    @item = Item.find_by_id(params[:id])
    url = request.base_url + @item.url
    qrcode = RQRCode::QRCode.new(url)
    # With default options specified explicitly
    # render image: @qr.as_png
    png = qrcode.as_png(
      resize_gte_to: false,
      resize_exactly_to: false,
      fill: 'white',
      color: 'black',
      size: 120,
      border_modules: 0,
      module_px_size: 0,
      file: nil # path to write
    )
    response.headers['Cache-Control'] = "public, max-age=#{36.hours.to_i}"
    response.headers['Content-Type'] = 'image/png'
    response.headers['Content-Disposition'] = 'inline'
    render :text => png
  end

  # DELETE /items/1
  def destroy
    item = Item.find_by_id(params[:id])
    item.delete
    render json: {'status' => 'OK'}
  end

  # PATCH/PUT /items/1
  # PATCH/PUT /items/1.json
  def update
    item = Item.find_by_id(params[:id])
    if item.update_attributes(item_params)
      item = Item.includes(ItemsController.item_selection).find_by_id(item.id)
      render json: item.as_json(ItemsController.item_as_json)
    else
      render :action => "edit"
    end
  end


  def index
  end

  def search_to_add
    @search = params[:q]
    items = Item.includes(ItemsController.item_selection).where('immo_code like ?', "%#{@search}%")
    render json: items.as_json(ItemsController.item_as_json)
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def item_params
    params.require(:item).permit(:x, :y, :room_id, :item_type_id, :item_quality_id, :immo_code)
  end


end
