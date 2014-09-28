require_dependency 'buildings_manager'

class BuildingsController < GeopController
  before_action :set, only: [:export]

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
    # id = params[:id]
    # a = BuildingsManager.new(id)
    # a.delete_recursive
    redirect_to '/'
    # render :text => 'Suppression du bâtiment numéro %d.' % id
  end


  def export
    exporter = BuildingsExport.new(@building)
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
