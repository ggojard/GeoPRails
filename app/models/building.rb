class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors, -> {order(:level)}, :dependent => :destroy
  accepts_nested_attributes_for :floors, :allow_destroy => true
  after_commit :reset_arm
  after_destroy :reset_arm
  after_create :reset_arm

  has_many :admin_user_role_to_buildings, :dependent => :destroy
  has_many :admin_user_roles, :through => :admin_user_role_to_buildings, :dependent => :destroy
  accepts_nested_attributes_for :admin_user_role_to_buildings, :allow_destroy => true
  accepts_nested_attributes_for :admin_user_roles, :allow_destroy => true

  def reset_arm
    Ability.reset_arm
  end

  def url
    "/#/buildings/%d" % self.id
  end


  def build_filters filters, filter_name, floor
    floor.filters[filter_name].each do |key, array|
      ap key
      ap filters[filter_name]
      if key != 'ids'
        if filters[filter_name][key].nil?
          filters[filter_name][key] = Floor.initial_filter_value
        end
        ap filters[filter_name]

        Floor.merge_filter_value(filters[filter_name][key], array)
      end
    end

  end

  def filters
    f = {
      'room_type' => {"ids" => {}},
      'organization' => {"ids" => {}},
      'evacuation_zone' => {"ids" => {}},
      'room_ground_type' => {"ids" => {}}
    }
    self.floors.each do |floor|
      build_filters(f, 'room_type', floor)
      build_filters(f, 'organization', floor)
      build_filters(f, 'evacuation_zone', floor)
      build_filters(f, 'room_ground_type', floor)
    end
    return f
  end

  def information
    info = {
      "numberOfRooms" => 0,
      "numberOfPeople" => 0,
      "numberOfFreeDesk" => 0,
      "totalArea" => 0
    }
    self.floors.each do |f|
      info['numberOfRooms'] += f.information['numberOfRooms']
      info['numberOfPeople'] += f.information['numberOfPeople']
      info['numberOfFreeDesk'] += f.information['numberOfFreeDesk']
      info['totalArea'] += f.information['totalArea']
    end
    info['totalArea'] = info['totalArea'].round(2)
    return info
  end

  default_scope {order(:name)}
end
