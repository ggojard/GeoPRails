class Item < ActiveRecord::Base
  default_scope {order(:name)}

  has_many :inventories, :dependent => :destroy
  has_many :rooms, :through => :inventories
  accepts_nested_attributes_for :inventories, :allow_destroy => true
  accepts_nested_attributes_for :rooms, :allow_destroy => true

  def url
    '/#/items/%d' % self.id
  end

  def qrcode_url
    '/items/%d.qrcode.png' % self.id
  end

end
