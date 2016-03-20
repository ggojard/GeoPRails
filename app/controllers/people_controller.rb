class PeopleController < GeopController
  @includes_people = [{:affectations => {:room => [{:floor => :building}, :room_type]}}, :person_state, :organization]
  def as_json_people
    {:include => [{:affectations => {:include => {:room => {:methods=> [:fullname, :area_unit, :url, :url_with_floor], :include => [{:floor => {:include => :building}}, :room_type]  }}}}, :person_state, {:organization => {:methods => [:url, :photo_url]}}], :methods => PeopleController.json_methods}
  end
  def as_json_people_index
    {:include => [:person_state, :organization], :methods => PeopleController.json_methods}
  end
  def self.json_methods
    [:format_telephone, :format_cellphone, :name, :fullname]
  end
  def show
    respond_to do |format|
      format.json{
        u_arm_floors_id = $arm[current_admin_user.id].floors_id;
        p = Person.includes(@includes_people).find_by_id(params[:id])
        pJson = p.as_json(as_json_people)
        affectations = []
        pJson['affectations'].each { |a|
          room = a['room']
          if !room.nil? and u_arm_floors_id.include? room['floor_id'].to_i
            affectations << a
          end
        }
        pJson['affectations'] = affectations
        render json: pJson
      }
    end
  end

  def index
    respond_to do |format|
      format.json{
        p = Person.includes([:person_state, :organization])
        pJson = p.as_json(as_json_people_index)
        render json: pJson
      }
    end
  end
end
