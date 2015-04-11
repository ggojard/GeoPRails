class Item < ActiveRecord::Base
  default_scope {order(:name)}

  has_many :inventories
  has_many :rooms, :through => :inventories
  accepts_nested_attributes_for :inventories, :allow_destroy => true
  accepts_nested_attributes_for :rooms, :allow_destroy => true

  def url
    '/items/%d' % self.id
  end


end
