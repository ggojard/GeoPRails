class HomesController < ApplicationController
  def search
    @q = params[:q].downcase
    @search = "%#{@q}%"
    @resArray = []


    people = Person.where(["lower(firstname) like ? OR lower(lastname) like ?", @search, @search]).each { |b| b.as_json(:methods => [:fullname]) }
    rooms = Room.where(["lower(name) like ?", @search]).collect { |b| b.as_json(:methods => [:fullname])}
    floors = Floor.where(["lower(name) like ?", @search]).collect { |b| b.as_json(:methods => [:fullname])}
    organizations = Organization.where(["lower(name) like ?", @search]).collect { |b| b.as_json(:methods => [:fullname])}

    @res = {
      "rooms" => rooms,
      "people" => people,
      "floors" => floors,
      "organizations" => organizations,
      "length" => rooms.count + people.count + floors.count + organizations.count
    }
    render json: @res
  end
end
