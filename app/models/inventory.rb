class Inventory < ActiveRecord::Base
  belongs_to :room
  belongs_to :item

  def to_builder
    Jbuilder.new do |b|
      b.(self, :room, :quantity)
      @i = Item.find(self.item_id)
      b.item  @i.to_builder.attributes!
    end
  end


end

