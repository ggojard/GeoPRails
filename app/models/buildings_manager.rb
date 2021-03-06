class BuildingsManager
  def initialize buildingId
    @building = Building.find_by_id(buildingId)
  end

  def delete_recursive
    if !@building.nil?
      @building.destroy
    end
  end


  def duplicate
    new_b = @building.dup
    new_b.save
    new_b.name += " (%d)" % new_b.id

    # add the building to the user role
    @building.admin_user_role_to_buildings.each do |rtb|
      new_rtb = rtb.dup
      new_rtb.building_id = new_b.id
      new_rtb.save
    end

    @building.floors.each do |f|
      new_f = f.dup
      new_f.building_id = new_b.id
      new_f.save
      FloorsImage.where("floor_id = %d" % f.id).each do |fi|
        new_fi = fi.dup
        new_fi.floor_id = new_f.id
        new_fi.save
      end
      f.rooms.each do |r|
        new_r = r.dup
        new_r.floor_id = new_f.id
        new_r.save

        r.affectations.each do |aff|
          new_aff = aff.dup
          new_aff.room_id = new_r.id
          new_aff.save
        end

        r.items.each do |i|
          new_item = i.dup
          new_item.room_id = new_r.id
          new_item.save
        end
      end
    end
    new_b.save
    @b = new_b
  end

  def id
    @b.id
  end

  def to_str
    @b.name
  end

end
