class ItemType < ActiveRecord::Base
  default_scope {order(:name)}

  belongs_to :room
  belongs_to :item_type


  def url
    '/#/item/%d' % self.id
  end

  def qrcode_url
    '/item/%d.qrcode.png' % self.id
  end

end
