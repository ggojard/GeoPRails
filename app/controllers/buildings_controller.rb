class BuildingsController < GeopController
  before_action :set, only: [:show, :export]

  def show
    @G_Building = @building.to_builder.target!
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
      sheet.add_row ["Identifiant", "Nom", "Identifiant Batiment"]

      wb.add_worksheet(:name => "Pièces") do |sheet_p|
        
        titleRow = ["Identifiant", "Nom", "Metrage (m²)"]
        titleRow += ["Type", "Identifiant Type", "Nature des sols", "Identifiant Nature des sols", "Zone d'évacuation", "Identifiant Zone d'évacuation", "Organisation", "Identifiant Organisation"]
        titleRow += ["Identifiant Etage", "Nom Etage", "Nom Batiment"]
        titleRow += ['Points']
        sheet_p.add_row titleRow

        @building.floors.each do |f|
          sheet.add_row [f.id, f.name, @building.id]
          f.rooms.each do |r|

            row = [r.id, r.name, r.area]
            row += add_belongs_to_property_in_row r, 'room_type'
            row += add_belongs_to_property_in_row r, 'room_ground_type'
            row += add_belongs_to_property_in_row r, 'evacuation_zone'
            row += add_belongs_to_property_in_row r, 'organization'
 
            row += [f.id, f.name, @building.name]
            row += [r.points]

            sheet_p.add_row row
            # ret += row.to_s

          end
        end
      end
    end


    time=DateTime.now.strftime('%Y-%m-%d-%Hh%M')
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
    @building = Building.find(params[:id])
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
