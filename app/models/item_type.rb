class ItemType < ActiveRecord::Base
  default_scope {order(:name)}

  has_many :inventories, :dependent => :destroy
  has_many :rooms, :through => :inventories
  accepts_nested_attributes_for :inventories, :allow_destroy => true
  accepts_nested_attributes_for :rooms, :allow_destroy => true

  def url
    '/#/item_types/%d' % self.id
  end

  def qrcode_url
    '/item_types/%d.qrcode.png' % self.id
  end

end
