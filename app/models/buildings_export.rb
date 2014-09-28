class BuildingsExport
	def initialize building
		@building = building
	end

	def export
		require 'axlsx'


		labels = I18n.t('formtastic.labels')
		models = I18n.t('activerecord.models')

		ret = "hi\n"

		p = Axlsx::Package.new
		wb = p.workbook
		wb.add_worksheet(:name => I18n.t('activerecord.models.building.other')) do |sheet|
			sheet.add_row [I18n.t('formtastic.labels.building.id'), I18n.t('formtastic.labels.building.name'), I18n.t('formtastic.labels.building.company')]
			sheet.add_row [@building.id, @building.name, @building.company.name]
		end

		wb.add_worksheet(:name => I18n.t('activerecord.models.floor.other')) do |sheet|
			sheet.add_row [I18n.t('formtastic.labels.floor.id'), I18n.t('formtastic.labels.floor.name'), I18n.t('formtastic.labels.building.id'), I18n.t('formtastic.labels.floor.level')]

			wb.add_worksheet(:name => I18n.t('activerecord.models.room.other')) do |sheet_p|

				titleRow = [I18n.t('formtastic.labels.room.id'), I18n.t('formtastic.labels.room.name'), I18n.t('formtastic.labels.room.area'), I18n.t('formtastic.labels.room.perimeter')]
				titleRow += [I18n.t('formtastic.labels.room.room_type'), I18n.t('formtastic.labels.room_type.id'), I18n.t('formtastic.labels.room.room_ground_type'), I18n.t('formtastic.labels.room_ground_type.id'), I18n.t('formtastic.labels.room.evacuation_zone'), I18n.t('formtastic.labels.evacuation_zone.id'), I18n.t('formtastic.labels.room.organization'), I18n.t('formtastic.labels.organization.id')]
				titleRow += [I18n.t('formtastic.labels.floor.id'), "Nom Etage", "Nom Batiment"]
				titleRow += ['Points', 'Ports Réseau']
				sheet_p.add_row titleRow

				@building.floors.each do |f|
					sheet.add_row [f.id, f.name, @building.id, f.level]
					f.rooms.each do |r|

						row = [r.id, r.name, r.area, r.perimeter]
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

		wb.add_worksheet(:name => I18n.t('activerecord.models.organization_type.other')) do |sheet|
			sheet.add_row ["Identifiant", "Nom"]
			OrganizationType.all().each do |o|
				sheet.add_row [o.id, o.name]
			end
		end

		wb.add_worksheet(:name => I18n.t('activerecord.models.person.other')) do |sheet|
			sheet.add_row ["Identifiant", "Prénom", "Nom de famille", "Téléphone", "Portable", "Référence Ordinateur", "Référence écran", "Email"]
			Person.all().each do |o|
				sheet.add_row [o.id, o.firstname, o.lastname, o.telephone, o.cellphone, o.computerreference, o.monitorreference, o.email], :types => [nil, nil, nil, :string, :string, nil, nil, nil]
			end
		end

		wb.add_worksheet(:name => I18n.t('activerecord.models.person_state.other')) do |sheet|
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
		@filename = sanitize_filename("export-#{@building.name}-#{time}.xlsx")
		path = "/tmp/#{@filename}"
		p.serialize(path)

		contents = IO.binread(path)
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
