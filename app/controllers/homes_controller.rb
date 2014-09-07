class HomesController < ApplicationController
  def search
    @q = params[:q].downcase
    @search = "%#{@q}%"
    @resArray = []


    people = Person.where(["lower(firstname) like ? OR lower(lastname) like ?", @search, @search]).map { |b| b.as_json(:methods => [:fullname, :url]) }
    rooms = Room.where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}
    floors = Floor.where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}
    organizations = Organization.where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}

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
