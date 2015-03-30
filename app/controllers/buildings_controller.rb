require_dependency 'buildings_manager'

class BuildingsController < GeopController
  before_action :set, only: [:export]

  # load_and_authorize_resource :nested => :company  

  def show
    respond_to do |format|
      format.html{
        b = Building.find_by_id(params[:id])
        gon.building = b.as_json(:methods => [:url])
      }
      format.json{
        b = Building.includes([:company, :floors => FloorsController.selection]).find_by_id(params[:id])
        render json: b.as_json(:methods => [:url], :include => [:company, {:floors => {:include => FloorsController.json_selection, :methods => [:url, :fullname]}}])
      }
    end
  end

  def url
    '/buildings/%d' % self.id
  end

  def duplicate
    id = params[:id]
    a = BuildingsManager.new(id)
    a.duplicate
    redirect_to building_path a.id
  end

  def delete_all
    id = params[:id]
    a = BuildingsManager.new(id)
    a.delete_recursive
    # redirect_to '/'
    render json: {"status" => "OK", "message" => 'Suppression du bâtiment numéro %d.' % id}
  end

  def import

    importer = BuildingsImport.new("/Users/pouya//Downloads/f.xlsx")


    # s = Roo::Excelx.new()

    # s.default_sheet = s.sheets[1]
    # s.each  do |r|
    #   puts r.inspect
    #   puts r[0]
    # end
    
    # puts s.last_row
    # i = 1
    # begin 
    #   puts s.cell(i,1) 
    #   i += 1
    # end until i > s.last_row


    # s.each_row_streaming do |row|
    #     puts row.inspect # Array of Excelx::Cell objects
    # end


    render json: {"status" => "OK"}
  end

  def export
    exporter = BuildingsExport.new([@building], @building.name)
    contents = exporter.export
    filename = exporter.filename
    content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    response.headers["Content-Disposition"] = "attachment; filename=\"#{filename}\""
    render :text => contents, :content_type => content_type
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set
    @building = Building.includes([:company, :floors => FloorsController.selection]).find_by_id(params[:id])
  end

end
