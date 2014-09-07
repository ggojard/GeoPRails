class PeopleController < GeopController

	def self.json_methods
		[:format_telephone, :format_cellphone, :name, :fullname]
	end

	def show
		p = Person.includes([{:affectations => {:room => [{:floor => :building}, :room_type]}}, :person_state, :organization]).find_by_id(params[:id])
		gon.person = p.as_json({:include => [{:affectations => {:include => {:room => {:methods=> [:fullname, :area_unit, :url], :include => [{:floor => {:include => :building}}, :room_type]  }}}}, :person_state, {:organization => {:methods => [:url]}}], :methods => PeopleController.json_methods})
	end

	def index
	end
end
