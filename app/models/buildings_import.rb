

class BuildingsImport
  require 'roo'


  def initialize file
    @s = Roo::Excelx.new(file)
    import_person_state
    import_room_ground_type
    import_organization_type
    import_room_type
    import_evacuation_zone
    import_company
    import_organization
    import_person
    import_buildings
    import_floors
    import_room
    import_affectation
    import_item
    import_inventory
  end

  def set_sheet number
    @s.default_sheet = @s.sheets[number]
  end


  def import_buildings
    set_sheet(0)
    @map_building = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)

      b =  Building.find_or_create_by(name: name)
      b.color = @s.cell(r, 3)
      b.company = @map_company[@s.cell(r, 5)]
      b.save

      @map_building[id] = b
    end
  end

  def import_floors
    set_sheet(1)
    @map_floor = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      level = @s.cell(r, 4)
      building_id = @s.cell(r, 3)
      conditions = {name: name, level: level, building: @map_building[building_id]}
      f = Floor.where(conditions).first_or_create

      f.map_scale_x1 = @s.cell(r, 5)
      f.map_scale_x2 = @s.cell(r, 6)
      f.map_scale_y1 = @s.cell(r, 7)
      f.map_scale_xy = @s.cell(r, 8)
      f.map_scale_length = @s.cell(r, 9)


      f.save
      @map_floor[id] = f

    end
  end

  def import_room
    set_sheet(2)
    @map_room = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2).to_s
      floor_id = @s.cell(r, 15)
      conditions = {name: name, floor: @map_floor[floor_id]}
      room = Room.where(conditions).first_or_create


      room.area = @s.cell(r, 3)
      room.perimeter = @s.cell(r, 4)
      room.free_desk_number = @s.cell(r, 5)
      room.anchor_text_point = @s.cell(r, 6)


      room.room_type = @map_room_type[@s.cell(r, 8)]
      room.room_ground_type = @map_room_ground_type[@s.cell(r, 10)]

      room.evacuation_zone = @map_evacuation_zone[@s.cell(r, 12)]
      room.organization = @map_organization[@s.cell(r, 14)]

      room.points = @s.cell(r, 18)
      room.network = @s.cell(r, 19)

      room.save

      @map_room[id] = room;
    end
  end


  def import_organization
    @map_organization = {}
    set_sheet(3)
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      org_type_id = @s.cell(r, 7)
      company_id = @s.cell(r, 5)
      conditions = {name: name, color: color, organization_type: @map_organization_type[org_type_id], company: @map_company[company_id]}
      @map_organization[id] = Organization.where(conditions).first_or_create
    end

    # load parent organisation
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      org_parent = @s.cell(r, 4)
      @map_organization[id].organization = @map_organization[org_parent]
      @map_organization[id].save
    end

  end



  def import_organization_type
    set_sheet(4)
    @map_organization_type = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      @map_organization_type[id] = OrganizationType.find_or_create_by(name: name)
    end
  end



  def import_person #merge
    set_sheet(5)
    @map_person = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      fistname = @s.cell(r, 2).to_s
      lastname = @s.cell(r, 3).to_s
      telephone = @s.cell(r, 5).to_s
      cellphone = @s.cell(r, 6).to_s
      computerreference = @s.cell(r, 7).to_s
      monitorreference = @s.cell(r, 8).to_s
      email = @s.cell(r, 9).to_s
      organization_id = @s.cell(r, 11)
      person_state_id = @s.cell(r, 13)
      conditions = {firstname: fistname, lastname: lastname, telephone: telephone, cellphone: cellphone,
                    computerreference: computerreference, monitorreference:monitorreference, email: email,
                    organization: @map_organization[organization_id], person_state: @map_person_state[person_state_id]}
      @map_person[id] = Person.where(conditions).first_or_create
    end
  end


  def import_person_state
    set_sheet(6)
    @map_person_state = {}
    2.upto(@s.last_row) do |r|
      id =@s.cell(r, 1)
      name = @s.cell(r, 2)
      @map_person_state[id] = PersonState.find_or_create_by(name: name)
    end
  end

  def import_room_ground_type
    set_sheet(7)
    @map_room_ground_type = {}
    2.upto(@s.last_row) do |r|
      id =@s.cell(r, 1)
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      @map_room_ground_type[id] = RoomGroundType.where({name: name, color: color}).first_or_create
    end
  end
  def import_room_type
    set_sheet(8)
    @map_room_type = {}
    2.upto(@s.last_row) do |r|
      id =@s.cell(r, 1)
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      @map_room_type[id] = RoomType.where({name: name, color: color}).first_or_create
    end
  end


  def import_evacuation_zone
    set_sheet(9)
    @map_evacuation_zone = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      @map_evacuation_zone[id] = EvacuationZone.where({name: name, color: color}).first_or_create
    end
  end


  def import_affectation
    set_sheet(10)
    @map_affectation = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      @map_affectation[id] = Affectation.where({room: @s.cell(r, 6), person: @s.cell(r, 3)}).first_or_create
    end
  end


  def import_inventory
    set_sheet(11)
    @map_inventory = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      i = Inventory.where({room: @s.cell(r, 6), item: @s.cell(r, 5)}).first_or_create
      i.quantity = @s.cell(r, 2)
      i.save
      @map_inventory[id] = i
    end
  end

  def import_company
    set_sheet(12)
    @map_company = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      @map_company[id] =  Company.find_or_create_by(name: name)
    end
  end

  def import_item
    set_sheet(13)
    @map_item = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      i =  Item.find_or_create_by(name: name)
      i.description = @s.cell(r, 3)
      @map_item[id]  = i
    end
  end


end
