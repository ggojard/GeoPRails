class BuildingsImport
  require 'roo'

  def initialize file
    @error = []
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
    import_item_type
    import_affectation
    import_inventory

    puts @error
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
      b.company = @map_company_id[@s.cell(r, 5)]
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
      f.map_scale_y1 = @s.cell(r, 6)
      f.map_scale_x2 = @s.cell(r, 7)
      f.map_scale_y2 = @s.cell(r, 8)
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
      room.organization = @map_organization_id[@s.cell(r, 14)]

      room.points = @s.cell(r, 18)
      room.network = @s.cell(r, 19)

      room.save

      @map_room[id] = room;
    end
  end


  def import_organization
    @map_organization_id = {}
    @map_organization_name = {}

    Organization.all.each {|o|
      @map_organization_id[o.id] = o
      @map_organization_name[o.name] = o
    }

    set_sheet(3)

    # @s.sheets[3].each(id: 0, name: 'FULL_NAME') do |hash|
    #   puts hash.inspect
    #   # => { id: 1, name: 'John Smith' }
    # end



    2.upto(@s.last_row) do |r|
      id = @s.excelx_value(r, 1)
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)

      company_id = @s.cell(r, 5)
      company_name = @s.cell(r, 6)

      org_type_id = @s.cell(r, 7)
      org_type_name = @s.cell(r, 8)

      if !org_type_id.nil?
        org_type = @map_organization_type_id[org_type_id]
      else
        org_type = @map_organization_type_name[org_type_name]
      end

      if !company_id.nil?
        company = @map_company_id[company_id]
      else
        company = @map_company_name[company_name]
      end

      if !id.nil?
        organization = Organization.find_by_id(id)

        puts ('ORGANIZATION BY ID %s,%s,%s' % [organization, id, color]).yellow

        if organization.nil?
          @error << "Impossible to find oranization with id %s" % id
        else
          if !color.nil?
            organization.color = color
          end
          if !company.nil?
            organization.company = company
          end
          if !org_type.nil?
            organization.organization_type = org_type
          end
          if !name.nil?
            organization.name = name
          end
          organization.save
        end
      else
        # puts 'First or Create ORGANIZATION [%s, %s, %s, %s]' % [name, color, org_type, company]
        conditions = {name: name, color: color, organization_type: org_type, company: company}
        organization = Organization.where(conditions).first_or_create
      end

      @map_organization_id[id] = organization
      @map_organization_name[name] = organization

    end

    # load parent organisation
    2.upto(@s.last_row) do |r|
      id = @s.excelx_value(r, 1)
      name = @s.cell(r, 2)
      org_parent_name = @s.cell(r, 4)

      if !org_parent_name.nil?
        if !id.nil?
          organization = Organization.find_by_id(id)
        else
          organization = Organization.find_by_name(name)
        end

        organization.organization = @map_organization_name[org_parent_name]
        organization.save
      end
    end
  end

  def import_organization_type
    set_sheet(4)

    @map_organization_type_id = {}
    @map_organization_type_name = {}

    OrganizationType.all.each {|ot|
      @map_organization_id[ot.id] = ot
      @map_organization_name[ot.name] = ot
    }

    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)

      if !id.nil?
        ot = OrganizationType.find_by_id(id)
        ot.name = name
        ot.save
      else
        ot = OrganizationType.find_or_create_by(name: name)
      end

      @map_organization_type_id[id] = ot
      @map_organization_type_name[name] = ot
    end
  end

  def import_person #merge
    set_sheet(5)
    @map_person = {}
    2.upto(@s.last_row) do |r|
      id = @s.excelx_value(r, 1)
      fistname = @s.cell(r, 2).to_s
      lastname = @s.cell(r, 3).to_s
      conditions = {firstname: fistname, lastname: lastname}
      person = Person.where(conditions).first_or_create

      # work on person items
      telephone = @s.excelx_value(r, 5).to_s
      cellphone = @s.excelx_value(r, 6).to_s
      computerreference = @s.excelx_value(r, 7).to_s
      monitorreference = @s.excelx_value(r, 8).to_s
      email = @s.cell(r, 9).to_s
      person_code = @s.excelx_value(r, 10).to_s

      organization_name = @s.cell(r, 11)
      organization_id = @s.excelx_value(r, 12)

      person_state_name = @s.cell(r, 13)
      person_state_id = @s.excelx_value(r, 14)

      person.telephone = telephone
      person.cellphone =  cellphone
      person.computerreference =  computerreference
      person.monitorreference = monitorreference
      person.email =  email
      person.person_code = person_code

      if !organization_id.nil?
        organization = @map_organization_id[organization_id]
      else
        organization = @map_organization_name[organization_name]
      end

      if !organization.nil?
        person.organization = organization
      end

      puts ('person organization %s,%s,%s' % [organization_id, organization_name, organization]).red

      # puts ('person_state id %s,%s' % [person_state_id, person_state_name]).red

      if !person_state_id.nil?
        person.person_state =  @map_person_state_id[person_state_id]
      else
        person.person_state =  @map_person_state_name[person_state_name]
      end

      # puts 'person state %s' % person.person_state

      person.save
      @map_person[id] = person;
    end
  end


  def import_person_state
    @map_person_state_id = {}
    @map_person_state_name = {}

    PersonState.all.each {|ps|
      @map_person_state_id[ps.id] = ps
      @map_person_state_name[ps.name] = ps
    }

    set_sheet(6)
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)

      if !id.nil?
        ps = PersonState.find_by_id(id)
        ps.name = name
        ps.save
      else
        ps = PersonState.find_or_create_by(name: name)
      end

      @map_person_state_id[ps.id] = ps
      @map_person_state_name[name] = ps
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


  def get_room_from_name building_name, floor_name, room_name
    building = Building.find_by_name(building_name)
    if !building.nil?
      floor = Floor.where({building_id: building.id, name: floor_name}).first
      if !floor.nil?
        room = Room.where({floor_id: floor.id, name: room_name}).first
        return room
      end
    end
    return nil
  end

  def import_affectation
    set_sheet(10)
    @map_affectation = {}
    2.upto(@s.last_row) do |r|
      id = @s.excelx_value(r, 1)

      room_name = @s.cell(r, 2)
      room_id = @s.excelx_value(r, 3)

      floor_name = @s.cell(r, 4)
      building_name = @s.cell(r, 5)

      workplace_name = @s.cell(r, 6)
      person_id = @s.excelx_value(r, 7)
      person_firstname = @s.cell(r, 8)
      person_lastname = @s.cell(r, 9)


      if !room_id.nil?
        room = @map_room[room_id]
        if room.nil?
          room = get_room_from_name(building_name, floor_name, room_name)
        end
      else
        room = get_room_from_name(building_name, floor_name, room_name)
      end

      if !person_id.nil?
        person =  @map_person[person_id]
      else
        person = Person.where({firstname: person_firstname, lastname: person_lastname}).first
      end

      # puts ('room : %s' % [room]).green
      # puts ('person : %s, %s, %s, %s' % [person, person_firstname, person_lastname, person_id]).green

      if (!room.nil? && !person.nil?)
        # puts ('room : %s, person : %s' % [room, person]).green
        @map_affectation[id] = Affectation.where({room: room, person: person}).first_or_create
        @map_affectation[id].workplace_name = workplace_name
        @map_affectation[id].save
      end
    end
  end


  def import_inventory
    set_sheet(11)
    @map_inventory = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      i = Inventory.where({room: @map_room[@s.cell(r, 6)], item_type: @map_item_type[@s.cell(r, 10)]}).first_or_create
      i.quantity = @s.cell(r, 2)
      i.save
      @map_inventory[id] = i
    end
  end

  def import_company
    set_sheet(12)
    @map_company_id = {}
    @map_company_name = {}

    Company.all.each{|c|
      @map_company_id[c.id] = c
      @map_company_name[c.name] = c
    }

    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)

      if !id.nil?
        c = Company.find_by_id(id)
        c.name= name
        c.save
      else
        c = Company.find_or_create_by(name: name)
      end

      @map_company_id[id] =  c
      @map_company_name[name] = c
    end
  end

  def import_item_type
    set_sheet(13)
    @map_item_type = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      name = @s.cell(r, 2)
      i =  ItemType.find_or_create_by(name: name)
      i.description = @s.cell(r, 3)
      i.code = @s.cell(r, 4)
      i.price = @s.cell(r, 5)
      i.save
      @map_item_type[id]  = i
    end
  end


end
