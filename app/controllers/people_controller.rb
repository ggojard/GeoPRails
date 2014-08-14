class PeopleController < GeopController
  def show
    @p = Person.find_by_id(params[:id])
    gon.person = @p.to_builder.target!
  end

  def index
  end
end
