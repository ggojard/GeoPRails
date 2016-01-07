class ItemsController < GeopController


  @items_include = [{:inventories => {:room => [{:floor => :building}, :room_type, :organization]}}]

  def as_json_item
    {:methods=> [:url], :include => 
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
    u_arm_floors_id = $arm[current_admin_user.id].floors_id;
    
    item = Item.includes(@items_include).find_by_id(params[:id])
    i = item.as_json(as_json_item)
    inventories = []
    i['inventories'].each { |a|
      room = a['room']
      if !room.nil? and u_arm_floors_id.include? room['floor_id'].to_i
        inventories << a
      end
    }
    i['inventories'] = inventories
    gon.items = [i]
  end

  def index
    items = Item.includes(@items_include)
    gon.items = items
  end

  def qrcode
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




end
