class PeopleController < GeopController
  def show
    @p = Person.find(params[:id])
    @G_Person = @p.to_builder.target!
  end

  def index
  end
end
