class CubyController < GeopController
  # def index
  # render json:{"Status" => "OK"}
  # end

  def show
    b = Building.find_by_id(params[:id])
    gon.building = b.as_json(:methods => [:url])

  end
end
