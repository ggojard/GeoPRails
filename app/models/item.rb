class Item < ActiveRecord::Base
  default_scope {order(:immo_code)}

  belongs_to :room
  belongs_to :item_type
  belongs_to :item_quality

  def url
    '/#/item/%d' % self.id
  end

  def qrcode_url
    '/items/%d.qrcode.png' % self.id
  end

  def name
    return self.immo_code
  end 

end
