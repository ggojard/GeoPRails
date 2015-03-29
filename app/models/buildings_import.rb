

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
  end

  def set_sheet number
    @s.default_sheet = @s.sheets[number]
  end


  def import_buildings
  end

  def import_floors
  end

  def import_room
  end

  def getHash (row, listColumns)
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


  def import_evacuation_zone
    set_sheet(9)
    2.upto(@s.last_row) do |r|
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      EvacuationZone.where({name: name, color: color}).first_or_create
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

  def import_room_type
    set_sheet(8)
    2.upto(@s.last_row) do |r|
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      RoomType.where({name: name, color: color}).first_or_create
    end
  end

  def import_room_ground_type
    set_sheet(7)
    2.upto(@s.last_row) do |r|
      name = @s.cell(r, 2)
      color = @s.cell(r, 3)
      RoomGroundType.where({name: name, color: color}).first_or_create
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

  def import_person #merge
    set_sheet(5)
    @map_person = {}
    2.upto(@s.last_row) do |r|
      id = @s.cell(r, 1)
      fistname = @s.cell(r, 2)
      lastname = @s.cell(r, 3)
      telephone = @s.cell(r, 5).to_s
      cellphone = @s.cell(r, 6).to_s
      computerreference = @s.cell(r, 7)
      monitorreference = @s.cell(r, 8)
      email = @s.cell(r, 9)
      organization_id = @s.cell(r, 11)
      person_state_id = @s.cell(r, 13)
      conditions = {firstname: fistname, lastname: lastname, telephone: telephone, cellphone: cellphone, 
        computerreference: computerreference, monitorreference:monitorreference, email: email, 
        organization: @map_organization[organization_id], person_state: @map_person_state[person_state_id]}
      Person.where(conditions).first_or_create
    end


  end



end
