class ItemTypesController < GeopController

  @items_include = [{:inventories => {:room => [{:floor => :building}, :room_type, :organization]}}]

  def as_json_item
    {:methods=> [:url, :qrcode_url], :include =>
     [{:inventories =>
       {:include =>
        {:room =>
         {:methods=> [:fullname, :url], :include => [{:floor => {:include => :building}}, :room_type]
          }
         }
        }
       }]
     }
  end

  def show
    respond_to do |format|
      format.json{
        u_arm_floors_id = $arm[current_admin_user.id].floors_id;

        item = ItemType.includes(@items_include).find_by_id(params[:id])
        i = item.as_json(as_json_item)
        inventories = []
        if !i['inventories'].nil?
          i['inventories'].each { |a|
            room = a['room']
            if !room.nil? and u_arm_floors_id.include? room['floor_id'].to_i
              inventories << a
            end
          }
          i['inventories'] = inventories
        end
        render json: i
      }
    end
  end

  def index
    items = ItemType.includes(@items_include)
    respond_to do |format|
      format.json{
        render json: items.as_json(as_json_item)
      }
    end
  end

  def qrcode
    @item = ItemType.find_by_id(params[:id])
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




end
