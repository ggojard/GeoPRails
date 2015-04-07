class ItemsController < GeopController


  @items_include = [{:inventories => {:room => [{:floor => :building}, :room_type, :organization]}}]


  def show
    items = Item.includes(@items_include).find_by_id(params[:id])
    gon.items = [items]
  end

  def index
    items = Item.includes(@items_include)
    gon.items = items
  end


end
