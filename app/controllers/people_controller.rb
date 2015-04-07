class PeopleController < GeopController



  @includes_people = [{:affectations => {:room => [{:floor => :building}, :room_type]}}, :person_state, :organization]

  def as_json_people
    {:include => [{:affectations => {:include => {:room => {:methods=> [:fullname, :area_unit, :url], :include => [{:floor => {:include => :building}}, :room_type]  }}}}, :person_state, {:organization => {:methods => [:url]}}], :methods => PeopleController.json_methods}
  end

  def self.json_methods
    [:format_telephone, :format_cellphone, :name, :fullname]
  end

	def show
		p = Person.includes(@includes_people).find_by_id(params[:id])
		gon.person = p.as_json(as_json_people)
	end

	def index
    p = Person.includes(@includes_people)
    gon.people = p.as_json(as_json_people)
	end
end
