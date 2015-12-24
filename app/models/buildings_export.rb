class BuildingsExport
  def initialize buildings, title, exportData
    @buildings = buildings
    @title = title
    @exportData = exportData
  end

  def export
    require 'axlsx'

    labels = I18n.t('formtastic.labels')
    models = I18n.t('activerecord.models')

    p = Axlsx::Package.new
    wb = p.workbook

    export_building(wb)
    export_floor(wb)
    export_organization(wb)
    export_organization_type(wb)
    personHeaders = export_person(wb)
    export_person_state(wb)
    export_room_ground_type(wb)
    export_room_type(wb)
    export_evacuation_zone(wb)
    export_affectation(wb, personHeaders)
    export_inventory(wb)
    export_company(wb)
    export_item(wb)

    time = DateTime.now.strftime('%Y-%m-%d-%Hh%M')
    @filename = sanitize_filename("export-#{@title}-#{time}.xlsx")
    path = "/tmp/#{@filename}"
    p.serialize(path)

    contents = IO.binread(path)
  end

  def export_building wb
    wb.add_worksheet(:name => I18n.t('activerecord.models.building.other')) do |sheet|
      sheet.add_row [I18n.t('formtastic.labels.building.id'), I18n.t('formtastic.labels.building.name'), "Color", I18n.t('formtastic.labels.building.company'), I18n.t('formtastic.labels.company.id')]
      if @exportData
        @buildings.each do |building|
          list =  [building.id, building.name, building.color]
          if !building.company.nil?
            list += [building.company.name, building.company.id]
          else
            list += ['', '']
          end
          sheet.add_row list
        end
      end
    end
  end

  def export_floor wb
    wb.add_worksheet(:name => I18n.t('activerecord.models.floor.other')) do |sheet|
      sheet.add_row [I18n.t('formtastic.labels.floor.id'), I18n.t('formtastic.labels.floor.name'), I18n.t('formtastic.labels.building.id'), I18n.t('formtastic.labels.floor.level'), "Échelle x1", "Échelle y1", "Échelle x2", "Échelle y2", "Échelle Taille"]

      wb.add_worksheet(:name => I18n.t('activerecord.models.room.other')) do |sheet_p|

        titleRow = [I18n.t('formtastic.labels.room.id'), I18n.t('formtastic.labels.room.name'), I18n.t('formtastic.labels.room.area'), I18n.t('formtastic.labels.room.perimeter'), "Places Libre", "Anchrage Texte"]
        titleRow += [I18n.t('formtastic.labels.room.room_type'), I18n.t('formtastic.labels.room_type.id'), I18n.t('formtastic.labels.room.room_ground_type'), I18n.t('formtastic.labels.room_ground_type.id'), I18n.t('formtastic.labels.room.evacuation_zone'), I18n.t('formtastic.labels.evacuation_zone.id'), I18n.t('formtastic.labels.room.organization'), I18n.t('formtastic.labels.organization.id')]
        titleRow += [I18n.t('formtastic.labels.floor.id'), "Nom Etage", "Nom Batiment"]
        titleRow += ['Points', I18n.t('formtastic.labels.room.network')]
        sheet_p.add_row titleRow

        if @exportData
          @buildings.each do |building|

            building.floors.each do |f|
              sheet.add_row [f.id, f.name, building.id, f.level, f.map_scale_x1, f.map_scale_y1, f.map_scale_x2, f.map_scale_y2, f.map_scale_length]
              f.rooms.each do |r|

                row = [r.id, r.name, r.area, r.perimeter, r.free_desk_number, r.anchor_text_point]
                row += add_belongs_to_property_in_row r, 'room_type'
                row += add_belongs_to_property_in_row r, 'room_ground_type'
                row += add_belongs_to_property_in_row r, 'evacuation_zone'
                row += add_belongs_to_property_in_row r, 'organization'

                row += [f.id, f.name, building.name]
                row += [r.points, r.network]

                sheet_p.add_row row
              end
            end
          end
        end
      end
    end
  end

  def export_organization wb
    wb.add_worksheet(:name => "Organizations") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur", "Organisation Père", "Identifiant Entreprise", "Entreprise", "Identifiant Type", "Type"]

      if @exportData
        Organization.all().each do |o|
          list = [o.id, o.name, o.color]

          if !o.organization.nil?
            list += [o.organization.id]
          else
            list += ['']
          end

          if !o.company.nil?
            list += [o.company.id, o.company.name]
          else
            list += ['', '']
          end
          if !o.organization_type.nil?
            list += [o.organization_type.id, o.organization_type.name]
          end
          sheet.add_row list
        end
      end
    end
  end
  def export_organization_type wb
    wb.add_worksheet(:name => I18n.t('activerecord.models.organization_type.other')) do |sheet|
      sheet.add_row ["Identifiant", "Nom"]
      if @exportData
        OrganizationType.all().each do |o|
          sheet.add_row [o.id, o.name]
        end
      end
    end

  end
  def export_person wb

    personHeaders = ["Identifiant Personne", "Prénom", "Nom de famille", "Nom complet", "Téléphone", "Portable", "Référence Ordinateur", "Référence écran", "Email", "Matricule", "Organisation", "Identifiant Organisation", "Etat", "Identifiant Etat"]

    def personData o
      list = [o.id, o.firstname, o.lastname, o.fullname, o.telephone, o.cellphone, o.computerreference, o.monitorreference, o.email, o.person_code]
      if !o.organization.nil?
        list += [o.organization.name, o.organization.id]
      else
        list += ['', '']
      end
      if !o.person_state.nil?
        list += [o.person_state.name, o.person_state.id]
      else
        list += ['', '']
      end
      return list
    end


    wb.add_worksheet(:name => I18n.t('activerecord.models.person.other')) do |sheet|
      sheet.add_row personHeaders
      if @exportData
        Person.all().each do |o|
          list = personData(o)
          sheet.add_row list , :types => [nil, nil, nil, :string, :string, nil, nil, nil]
        end
      end
    end
    return personHeaders
  end


  def export_person_state wb
    wb.add_worksheet(:name => I18n.t('activerecord.models.person_state.other')) do |sheet|
      sheet.add_row ["Identifiant", "Nom"]
      if @exportData
        PersonState.all().each do |o|
          sheet.add_row [o.id, o.name]
        end
      end
    end
  end


  def export_room_ground_type wb
    wb.add_worksheet(:name => "Nature des sols") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur"]
      if @exportData
        RoomGroundType.all().each do |o|
          sheet.add_row [o.id, o.name, o.color]
        end
      end
    end
  end

  def export_room_type wb
    wb.add_worksheet(:name => "Type des pièces") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur"]
      if @exportData
        RoomType.all().each do |o|
          sheet.add_row [o.id, o.name, o.color]
        end
      end
    end
  end

  def export_evacuation_zone wb
    wb.add_worksheet(:name => "Zones d'évacuation") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur"]
      if @exportData
        EvacuationZone.all().each do |o|
          sheet.add_row [o.id, o.name, o.color]
        end
      end
    end

  end

  def export_affectation wb, personHeaders
    wb.add_worksheet(:name => "Affectations") do |sheet|
      headers = ["Identifiant", "Pièce", "Identifiant Pièce", "Nom Etage", "Nom Batiment"]
      headers += personHeaders
      sheet.add_row  headers
      if @exportData
        Affectation.all().each do |o|
          if !o.person.nil? and !o.room.nil? and !o.room.floor.nil? and !o.room.floor.building.nil? and @buildings.include?(o.room.floor.building)
            row = [o.id, o.room.name, o.room.id, o.room.floor.name, o.room.floor.building.name]
            row += personData(o.person)
            sheet.add_row row
          end
        end
      end
    end
  end

  def export_inventory wb
    wb.add_worksheet(:name => "Inventaire") do |sheet|
      sheet.add_row ["Identifiant",  "Quantité", "Code", "Nom item", "Pièce", "Identifiant Pièce", "Nom Etage", "Nom Batiment", "Item", "Identifiant Item", "Prix"]
      if @exportData
        Inventory.all().each do |o|
          if !o.item.nil? and !o.room.nil? and !o.item.nil?
            price = 0
            if !o.quantity.nil? and !o.item.price.nil?
              price = o.quantity * o.item.price
            end
            sheet.add_row [o.id, o.quantity, o.item.code, o.item.name, o.room.name, o.room.id, o.room.floor.name, o.room.floor.building.name, o.item.name, o.item.id, price]
          end
        end
      end
    end
  end

  def export_company wb
    wb.add_worksheet(:name => "Entreprise") do |sheet|
      sheet.add_row ["Identifiant",  "Nom"]
      if @exportData
        Company.all().each do |o|
          sheet.add_row [o.id, o.name]
        end
      end
    end
  end

  def export_item wb
    wb.add_worksheet(:name => "Item") do |sheet|
      sheet.add_row ["Identifiant",  "Nom", "Description", "Code", "Prix", I18n.t('formtastic.labels.item.purchase_date')]
      if @exportData
        Item.all().each do |o|
          sheet.add_row [o.id, o.name, o.description, o.code, o.price, o.purchase_date]
        end
      end
    end
  end

  def filename
    return @filename
  end


  def add_belongs_to_property_in_row r, propertyName
    p = r.send(propertyName)
    if p != nil
      row = [ p.name, p.id]
    else
      row = ['','']
    end
  end

  def sanitize_filename(filename)
    # Split the name when finding a period which is preceded by some
    # character, and is followed by some character other than a period,
    # if there is no following period that is followed by something
    # other than a period (yeah, confusing, I know)
    fn = filename.split /(?<=.)\.(?=[^.])(?!.*\.[^.])/m

    # We now have one or two parts (depending on whether we could find
    # a suitable period). For each of these parts, replace any unwanted
    # sequence of characters with an underscore
    fn.map! { |s| s.gsub /[^a-z0-9\-]+/i, '_' }

    # Finally, join the parts with a period and return the result
    return fn.join '.'
  end

end
