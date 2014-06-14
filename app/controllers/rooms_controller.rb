class RoomsController < ApplicationController
  def index
    @homes = Home.all
  end
  # GET /homes/1
  # GET /homes/1.json
  def show
  end

end
