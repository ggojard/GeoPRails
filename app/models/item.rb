class Item < ActiveRecord::Base
  default_scope {order(:name)}

  belongs_to :room
  belongs_to :item_type
  belongs_to :item_quality

  def url
    '/#/item/%d' % self.id
  end

  def qrcode_url
    '/item/%d.qrcode.png' % self.id
  end

  def name
    return self.code_immo
  end 

end
