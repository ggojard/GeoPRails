class Room < ActiveRecord::Base
  belongs_to :room_type
  belongs_to :floor
  belongs_to :organization
  belongs_to :room_ground_type
  belongs_to :evacuation_zone



  has_many :affectations
  has_many :people, :through => :affectations
  accepts_nested_attributes_for :people, :allow_destroy => true
  accepts_nested_attributes_for :affectations, :allow_destroy => true

  has_many :inventories
  has_many :items, :through => :inventories
  accepts_nested_attributes_for :inventories, :allow_destroy => true
  accepts_nested_attributes_for :items, :allow_destroy => true


  def fullname
    room_fullname = self.name
    if !self.floor.nil?
      if !self.floor.name.nil?
        room_fullname += ' < ' + self.floor.name
      end
      if !self.floor.building.name.nil?
        room_fullname += ' < ' + self.floor.building.name
      end
    end
    return room_fullname
  end

  def area_unit
    self.area.to_s + ' m²'
  end

  # def addBelongsToToJsonBuilder builder,propertyName, c
  #   pIdName = propertyName + '_id'
  #   pId = self.send[pIdName]
  #   if pId != nil
  #     o = c.find(pId)
  #     b[propertyName]  o.to_builder.attributes!
  #   else
  #     b[propertyName] nil
  #   end
  # end
  #
  def to_builder_search
    Jbuilder.new do |b|
      b.(self, :fullname)
      b.url '/rooms/' +  self.id.to_s
    end
  end

  def extract_organization(b)
    if !self.organization_id.nil?
      o = Organization.find_by_id(self.organization_id)
      if !o.nil?
        b.organization  o.to_builder.attributes!
      end
    else
      b.organization nil
    end
  end

  def extract_json(b)
    b.(self, :name, :id, :room_type, :floor, :points, :area, :room_ground_type, :area_unit, :fullname, :evacuation_zone, :organization, :network)
    b.url "/rooms/" + self.id.to_s

  end

  def to_builder_with_affectations
    Jbuilder.new do |b|
      extract_json b
      b.affectations self.affectations.collect { |b| b.to_builder.attributes! }
      b.inventories self.inventories.collect { |b| b.to_builder.attributes! }
    end
  end


  def to_builder_no_affectations
    Jbuilder.new do |b|
      extract_json b
       b.inventories self.inventories.collect { |b| b.to_builder.attributes! }
    end
  end

  def to_builder_test
    Jbuilder.new do |b|
      extract_json b
      # extract_organization b
       # b.inventories self.inventories.collect { |b| b.to_builder.attributes! }
    end
  end


  def to_builder_no_organization
    Jbuilder.new do |b|
      extract_json b
      # b.(self, :name)
      b.(:organization)
      # b.affectations self.affectations.collect { |b| b.to_builder.attributes! }
      # b.inventories self.inventories.collect { |b| b.to_builder.attributes! }
    end

  end

  def to_builder
    Jbuilder.new do |b|
      extract_json b
      # extract_organization b
      b.affectations self.affectations.collect { |b| b.to_builder.attributes! }
      b.inventories self.inventories.collect { |b| b.to_builder.attributes! }
    end
  end



end
