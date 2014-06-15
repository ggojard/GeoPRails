class BuildingsController < ApplicationController
  before_action :set, only: [:show]

  def show
    @json = @buildings.to_builder.target!.to_json
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @buildings = Building.find(params[:id])
  end
end
