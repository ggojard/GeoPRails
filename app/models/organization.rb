class Organization < ActiveRecord::Base
  require 'geop_libs'

  after_commit :delete_references_cache
  after_destroy :delete_references_cache
  after_create :delete_references_cache

  def delete_references_cache
    GeoPLibs.delete_references_cache
  end

  def color_rgba_with_opacity
    GeoPLibs.color_rgba_with_opacity self.color
  end

  default_scope {order(:name)}

  belongs_to :organization_type
  belongs_to :organization
  belongs_to :company

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :people
  accepts_nested_attributes_for :people, :allow_destroy => true

  has_many :rooms
  accepts_nested_attributes_for :rooms, :allow_destroy => true

  def url
    '/#/organizations/%d' %  self.id
  end

  def information
    buildings_info = {}
    self.rooms.each {|r|
      building_for_room = buildings_info[r.building_id]
      if !building_for_room.present?
        building_for_room = Floor.initial_information_value
        building_for_room['capacitySum'] = 0
        building_for_room['ratio'] = 0
        building_for_room['numberOfFloors'] = [];
      end
      if r.capacity.present?
        building_for_room['capacitySum'] += r.capacity
      end
      building_for_room['numberOfRooms'] += 1
      building_for_room['numberOfPeople'] += r.affectations_count
      building_for_room['numberOfFreeDesk'] += r.free_desk_number
      building_for_room['totalArea'] += r.area
      roomPeopleSum = building_for_room['numberOfPeople'] + building_for_room['numberOfFreeDesk']
      building_for_room['ratio'] = (building_for_room['totalArea'] / (roomPeopleSum)).round(2)
      building_for_room['numberOfFloors'] << r.floor_id
      buildings_info[r.building_id] = building_for_room
    }
    buildings_info.each {|k,v|
      v['totalArea'] = v['totalArea'].round(2)
      v['numberOfFloors'] = v['numberOfFloors'].uniq.size
    }
    return buildings_info
  end

  def data
    buildings = {}
    all_floors = []

    self.rooms.each {|r|
      if !buildings[r.building_id].present?
        buildings[r.building_id] = []
      end
      buildings[r.building_id] << {"floor_id" => r.floor_id, "level" => r.floor.level}
      all_floors << r.floor_id
    }

    buildings.each {|k,v|
      buildings[k] = v.uniq.sort_by{|e| e[:level]}.map{|f| f['floor_id']}
    }
    all_floors = all_floors.uniq

    return {"buildings"=> buildings, "all_floors" => all_floors}
  end

end
