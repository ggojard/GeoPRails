require_dependency 'buildings_manager'

class BuildingsController < GeopController
  before_action :set, only: [:show, :export]

  def show    
    gon.building = @building.as_json(:include => [:company, {:floors => {:include => FloorsController.json_selection}}])
  end

  def url
    '/buildings/%d' % self.id
  end

  def duplicate
    id = params[:id]
    a = BuildingsManager.new(id)
    a.duplicate
    redirect_to building_path a.id
    # render :text => a.to_str
  end

  def delete_all
    # id = params[:id]
    # a = BuildingsManager.new(id)
    # a.delete_recursive
    redirect_to '/'
    # render :text => 'Suppression du bâtiment numéro %d. <a></' % id
  end

  def export
    require 'axlsx'

    ret = "hi\n"

    p = Axlsx::Package.new
    wb = p.workbook
    wb.add_worksheet(:name => "Batiment") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Entreprise"]
      sheet.add_row [@building.id, @building.name, @building.company.name]
    end

    wb.add_worksheet(:name => "Etages") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Identifiant Batiment", "Niveau"]

      wb.add_worksheet(:name => "Pièces") do |sheet_p|

        titleRow = ["Identifiant", "Nom", "Metrage (m²)"]
        titleRow += ["Type", "Identifiant Type", "Nature des sols", "Identifiant Nature des sols", "Zone d'évacuation", "Identifiant Zone d'évacuation", "Organisation", "Identifiant Organisation"]
        titleRow += ["Identifiant Etage", "Nom Etage", "Nom Batiment"]
        titleRow += ['Points', 'Ports Réseau']
        sheet_p.add_row titleRow

        @building.floors.each do |f|
          sheet.add_row [f.id, f.name, @building.id, f.level]
          f.rooms.each do |r|

            row = [r.id, r.name, r.area]
            row += add_belongs_to_property_in_row r, 'room_type'
            row += add_belongs_to_property_in_row r, 'room_ground_type'
            row += add_belongs_to_property_in_row r, 'evacuation_zone'
            row += add_belongs_to_property_in_row r, 'organization'

            row += [f.id, f.name, @building.name]
            row += [r.points, r.network]

            sheet_p.add_row row
            # ret += row.to_s

          end
        end
      end
    end


    wb.add_worksheet(:name => "Organizations") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Identifiant Type", "Type"]
      Organization.all().each do |o|
        sheet.add_row [o.id, o.name, o.organization_type.id, o.organization_type.name]
      end
    end

    wb.add_worksheet(:name => "Organizations Type") do |sheet|
      sheet.add_row ["Identifiant", "Nom"]
      OrganizationType.all().each do |o|
        sheet.add_row [o.id, o.name]
      end
    end

    wb.add_worksheet(:name => "Personnes") do |sheet|
      sheet.add_row ["Identifiant", "Prénom", "Nom de famille", "Téléphone", "Portable", "Référence Ordinateur", "Référence écran", "Email"]
      Person.all().each do |o|
        sheet.add_row [o.id, o.firstname, o.lastname, o.telephone, o.cellphone, o.computerreference, o.monitorreference, o.email], :types => [nil, nil, nil, :string, :string, nil, nil, nil]
      end
    end


    wb.add_worksheet(:name => "Personnes Etat") do |sheet|
      sheet.add_row ["Identifiant", "Nom"]
      PersonState.all().each do |o|
        sheet.add_row [o.id, o.name]
      end
    end

    wb.add_worksheet(:name => "Nature des sols") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur"]
      RoomGroundType.all().each do |o|
        sheet.add_row [o.id, o.name, o.color]
      end
    end

    wb.add_worksheet(:name => "Type des pièces") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur"]
      RoomType.all().each do |o|
        sheet.add_row [o.id, o.name, o.color]
      end
    end

    wb.add_worksheet(:name => "Zones d'évacuation") do |sheet|
      sheet.add_row ["Identifiant", "Nom", "Couleur"]
      EvacuationZone.all().each do |o|
        sheet.add_row [o.id, o.name, o.color]
      end
    end

    wb.add_worksheet(:name => "Affectations") do |sheet|
      sheet.add_row ["Identifiant",  "Prénom", "Nom", "Nom complet", "Pièce", "Identifiant Pièce", "Nom Etage", "Nom Batiment"]
      Affectation.all().each do |o|
        if !o.person.nil? and !o.room.nil?
          sheet.add_row [o.id, o.person.firstname, o.person.lastname, o.person.fullname, o.room.name, o.room.id, o.room.floor.name, o.room.floor.building.name]
        end
      end
    end

    wb.add_worksheet(:name => "Inventaire") do |sheet|
      sheet.add_row ["Identifiant",  "Quantité", "Code", "Nom item", "Pièce", "Identifiant Pièce", "Nom Etage", "Nom Batiment"]
      Inventory.all().each do |o|
        if !o.item.nil? and !o.room.nil?
          sheet.add_row [o.id, o.quantity, o.item.code, o.item.name, o.room.name, o.room.id, o.room.floor.name, o.room.floor.building.name]
        end
      end
    end


    time = DateTime.now.strftime('%Y-%m-%d-%Hh%M')
    filename = sanitize_filename("export-#{@building.name}-#{time}.xlsx")
    path = "/tmp/#{filename}"
    p.serialize(path)

    contents = IO.binread(path)

    response.headers["Content-Disposition"] = "attachment; filename=\"#{filename}\""
    response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    render :text => contents
    # render :text => ret
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @building = Building.includes([:company, :floors => FloorsController.selection]).find_by_id(params[:id])
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
