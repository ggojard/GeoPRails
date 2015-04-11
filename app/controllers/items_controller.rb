class ItemsController < GeopController


  @items_include = [{:inventories => {:room => [{:floor => :building}, :room_type, :organization]}}]

  def as_json_item
    {:include => 
      [{:inventories => 
        {:include => 
          {:room => 
            {:methods=> [:fullname, :area_unit, :url], :include => [{:floor => {:include => :building}}, :room_type]  
            }
          }
        }
      }]
    }
  end


  def show
    item = Item.includes(@items_include).find_by_id(params[:id])

    
    gon.items = [item.as_json(as_json_item)]
  end

  def index
    items = Item.includes(@items_include)
    gon.items = items
  end


end
