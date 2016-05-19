class HomesController < GeopController
  def search
    @q = params[:q].downcase
    @search = "%#{@q}%"
    @resArray = []

    limit = 30
    people = Person.where(["lower(firstname) like ? OR lower(lastname) like ?", @search, @search]).take(limit).map { |b| b.as_json(:methods => [:fullname, :url]) }
    rooms = Room.includes(:floor => :building).where(["lower(name) like ?", @search]).take(limit).map { |b| b.as_json(:methods => [:fullname, :url, :url_with_floor])}
    floors = Floor.includes(:building).where(["lower(name) like ?", @search]).take(limit).map { |b| b.as_json(:methods => [:fullname, :url])}
    organizations = Organization.where(["lower(name) like ?", @search]).take(limit).map { |b| b.as_json(:methods => [:fullname, :url])}
    items = Item.where(["lower(immo_code) like ?", @search]).take(limit).map { |b| b.as_json(:methods => [:fullname, :url])}

    @res = {
      "rooms" => rooms,
      "people" => people,
      "floors" => floors,
      "organizations" => organizations,
      "items" => items,
      "length" => rooms.size + people.size + floors.size + organizations.size
    }
    render json: @res
  end

  def show
  end

  def clear_cache
    puts 'The cache has been clear'
    Rails.cache.clear(nil)
    render json: "ok"
  end

  def clean_repo
    counter = 0
    counter_role_to_building = 0
    affectations = Affectation.includes([:room, :person])
    affectations.each { |a|  
     if a.room.nil? || a.person.nil? 
      a.delete
      counter += 1
     end
    }
    admin_user_role_to_buildings = AdminUserRoleToBuilding.includes([:admin_user_role, :building])
    admin_user_role_to_buildings.each { |a|
      if a.building.nil? || a.admin_user_role.nil?
        a.delete
        counter_role_to_building += 1
      end
    }

    render json: {
      'delete_affectations' => counter,
      'counter_role_to_building' => counter_role_to_building
    }
  end
end
