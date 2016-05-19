class Floor < ActiveRecord::Base
  require "awesome_print"

  belongs_to :building
  has_many :rooms, :dependent => :destroy
  accepts_nested_attributes_for :rooms

  has_attached_file :image,:styles => { :thumb => "200x200#" }, :storage => :database, :database_table => 'floors_images'
  validates_attachment :image, content_type: { content_type:     ["image/png"] }
  before_save :extract_dimensions
  serialize :image_dimensions

  def fullname
    name = self.name
    if !self.building.nil?
      name = "%s > %s" % [name, self.building.name]
    end
  end

  def url
    "/#/floors/%d" % self.id
  end

  def extract_dimensions
    tempfile = image.queued_for_write[:original]
    unless tempfile.nil?
      geometry = Paperclip::Geometry.from_file(tempfile)
      self.image_dimensions = { :w => geometry.width.to_i,  :h => geometry.height.to_i}.to_json
    end
  end

  def update_room_for_filter f, filter_name, r, value = nil
    filter_name_id = "#{filter_name}_id"
    if value.nil?
      value = r[filter_name_id]
    end
    if !value.nil?
      filter = f[filter_name][value]

      if filter.nil?
        filter = Floor.initial_filter_value
      end

      if !r.area.nil?
        filter['areaSum'] += r.area
        filter['areaSum'] = filter['areaSum'].round(2)
      end

      filter['nbPeople'] += r.affectations_count
      if !r.perimeter.nil?
        filter['perimeterSum'] += r.perimeter
      end
      filter['countRooms'] += 1
      filter['freeDeskNumberSum'] += r.free_desk_number
      if !r.capacity.nil?
        filter['capacitySum'] += r.capacity
      end
      filter['ratio'] = (filter['areaSum'] / (filter['nbPeople'] + filter['freeDeskNumberSum'])).round(2)

      f[filter_name][value] = filter
    end

  end

  def self.merge_filter_value source, target
    source['areaSum'] += target['areaSum']
    source['areaSum'] = source['areaSum'].round(2)

    source['nbPeople'] += target['nbPeople']
    source['perimeterSum'] += target['perimeterSum']
    source['countRooms'] += target['countRooms']
    source['freeDeskNumberSum'] += target['freeDeskNumberSum']
    source['capacitySum'] += target['capacitySum']
    source['ratio'] += (source['areaSum'] / (source['nbPeople'] + source['freeDeskNumberSum'])).round(2)
  end

  def self.initial_filter_value
    {
      "areaSum" => 0,
      "nbPeople" => 0,
      "countRooms" => 0,
      "perimeterSum" => 0,
      "freeDeskNumberSum" => 0,
      "capacitySum" => 0,
      "ratio" => 0
    }
  end

  def self.initial_information_value
     {
      "numberOfRooms" => 0,
      "numberOfPeople" => 0,
      "numberOfFreeDesk" => 0,
      "totalArea" => 0
    }
  end

  def information
    info = Floor.initial_information_value
    info['numberOfRooms'] = self.rooms.length
    self.rooms.each do |r|
      info['numberOfPeople'] += r.affectations_count
      info['numberOfFreeDesk'] += r.free_desk_number
      info['totalArea'] += r.area
    end
    info['totalArea'] = info['totalArea'].round(2)
    return info
  end

  def filters
    f = {
      'room_type' => {},
      'organization' => {},
      'evacuation_zone' => {},
      'room_ground_type' => {},
      'direction' => {}
    }
    self.rooms.each do |r|
      update_room_for_filter(f, 'room_type', r)
      update_room_for_filter(f, 'organization', r)
      update_room_for_filter(f, 'evacuation_zone', r)
      update_room_for_filter(f, 'room_ground_type', r)
      update_room_for_filter(f, 'direction', r,  r.direction_id)
    end
    return f
  end

  default_scope {order(:level)}
end
