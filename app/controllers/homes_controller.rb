class HomesController < ApplicationController
  def search
    @q = params[:q].downcase
    @search = "%#{@q}%"
    @resArray = []


    people = Person.where(["lower(firstname) like ? OR lower(lastname) like ?", @search, @search]).collect { |b| b.to_builder_search.attributes! }
    rooms = Room.where(["lower(name) like ?", @search]).collect { |b| b.to_builder_search.attributes!}
    floors = Floor.where(["lower(name) like ?", @search]).collect { |b| b.to_builder_search.attributes!}
    organizations = Organization.where(["lower(name) like ?", @search]).collect { |b| b.to_builder_search.attributes!}

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
