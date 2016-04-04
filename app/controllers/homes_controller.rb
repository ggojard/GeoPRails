class HomesController < GeopController
  def search
    @q = params[:q].downcase
    @search = "%#{@q}%"
    @resArray = []

    people = Person.where(["lower(firstname) like ? OR lower(lastname) like ?", @search, @search]).map { |b| b.as_json(:methods => [:fullname, :url]) }
    rooms = Room.includes(:floor => :building).where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url, :url_with_floor])}
    floors = Floor.includes(:building).where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}
    organizations = Organization.where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}
    items = Item.where(["lower(immo_code) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}

    @res = {
      "rooms" => rooms,
      "people" => people,
      "floors" => floors,
      "organizations" => organizations,
      "items" => items,
      "length" => rooms.count + people.count + floors.count + organizations.count
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
    affectation_no_room = Affectation.where('room_id is ?', nil)
    affectation_no_person = Affectation.where('person_id is ?', nil)

    affectation_no_room_count = affectation_no_room.count
    affectation_no_person_count = affectation_no_person.count
    puts 'affectation_no_room %d' % affectation_no_room.count
    puts 'affectation_no_person %d' % affectation_no_person.count

    affectation_no_room.select {|s| s.delete}
    affectation_no_person.select {|s| s.delete}

    render json: {
      'affectation_no_person' => affectation_no_person_count,
      'affectation_no_room' => affectation_no_room_count
    }
  end
end
