class Room < ActiveRecord::Base
  belongs_to :room_type
  belongs_to :floor
  belongs_to :organization
  belongs_to :room_ground_type
  belongs_to :evacuation_zone

  has_many :affectations, :dependent => :destroy
  has_many :people, :through => :affectations
  accepts_nested_attributes_for :people, :allow_destroy => true
  accepts_nested_attributes_for :affectations, :allow_destroy => true

  # has_many :items, :through => :inventories
  # accepts_nested_attributes_for :items, :allow_destroy => true

  # has_many :items
  # accepts_nested_attributes_for :items
  
  # has_many :inventories, :dependent => :destroy
  # accepts_nested_attributes_for :inventories, :allow_destroy => true

  def url
    '/rooms/%d' % self.id
  end

  def url_with_floor
    '/#/floors/%d?rId=%d' % [self.floor_id, self.id]
  end


  def fullname
    room_fullname = self.name
    if !self.floor.nil?
      if !self.floor.name.nil?
        room_fullname += ' < ' + self.floor.name
      end
      if !self.floor.building.nil? && !self.floor.building.name.nil?
        room_fullname += ' < ' + self.floor.building.name
      end
    end
    return room_fullname
  end
  
  default_scope {order(:name)}
end
