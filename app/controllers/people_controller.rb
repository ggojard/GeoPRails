class PeopleController < GeopController



  @includes_people = [{:affectations => {:room => [{:floor => :building}, :room_type]}}, :person_state, :organization]

  def as_json_people
    {:include => [{:affectations => {:include => {:room => {:methods=> [:fullname, :area_unit, :url], :include => [{:floor => {:include => :building}}, :room_type]  }}}}, :person_state, {:organization => {:methods => [:url, :photo_url]}}], :methods => PeopleController.json_methods}
  end

  def self.json_methods
    [:format_telephone, :format_cellphone, :name, :fullname]
  end

	def show
    u_arm_floors_id = $arm[current_admin_user.id].floors_id;

		p = Person.includes(@includes_people).find_by_id(params[:id])    
    gon.person = p.as_json(as_json_people)

    affectations = []
    gon.person['affectations'].each { |a|
      room = a['room']
      if !room.nil? and u_arm_floors_id.include? room['floor_id'].to_i
        affectations << a
      end
    }
    gon.person['affectations'] = affectations


	end

	def index
    p = Person.includes(@includes_people)
    gon.people = p.as_json(as_json_people)
	end
end
