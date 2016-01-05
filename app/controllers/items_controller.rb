class ItemsController < GeopController


  @items_include = [{:inventories => {:room => [{:floor => :building}, :room_type, :organization]}}]

  def as_json_item
    {:include => 
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


end
