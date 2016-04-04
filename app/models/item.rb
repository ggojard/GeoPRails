class Item < ActiveRecord::Base
  default_scope {order(:immo_code)}

  belongs_to :room
  belongs_to :item_type
  belongs_to :item_quality

  def url
    if !self.room.nil?
      '/#/floors/%d?itemId=%d' % [self.room.floor_id, self.id]
    else
      '/#/items/%d' % self.id
    end
  end

  def fullname
    if !self.item_type.nil?
      '%s (%s)' % [self.item_type.name, self.immo_code]
    else
      self.immo_code
    end
  end

  def qrcode_url
    '/items/%d.qrcode.png' % self.id
  end

  def name
    return self.immo_code
  end

end
