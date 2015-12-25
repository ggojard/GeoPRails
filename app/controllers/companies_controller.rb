class CompaniesController < GeopController
  require 'fileutils'

  def index
    if current_admin_user != nil
      c = Company.find_by_id(current_admin_user.company_id)
      redirect_to company_url(c)
    else
      render 'login/login'
    end
  end

  def organizations_hierarchy
    if current_admin_user != nil
      c = Company.includes(:organizations => [:organizations => :organizations]).find_by_id(current_admin_user.company_id)
      render json: c.as_json(:include => {:organizations => {:include => {:organizations => {:include => :organizations}}}})
    end
  end  

  def show
    # gon.organizations = Organization.all.as_json()
  end

  def import
    begin
      file = params[:file]
      FileUtils.copy(file.path, file.path + '.xlsx')
      importer = BuildingsImport.new(file.path + '.xlsx');
    rescue
      puts "Error #{$!}"
      return render json: {"status" => "KO", "error" => "Error #{$!}"}
    end
    # redirect_to root_path
    render json: {"status" => "OK"}
  end

  def export
    exporter = BuildingsExport.new(@global_company.buildings, @global_company.name, true)
    contents = exporter.export
    filename = exporter.filename
    content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    response.headers["Content-Disposition"] = "attachment; filename=\"#{filename}\""
    render :text => contents, :content_type => content_type
  end

  def export_template
    exporter = BuildingsExport.new(@global_company.buildings, @global_company.name, false)
    contents = exporter.export
    filename = 'template-' + exporter.filename
    content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    response.headers["Content-Disposition"] = "attachment; filename=\"#{filename}\""
    render :text => contents, :content_type => content_type
  end



  private

  # Never trust parameters from the scary internet, only allow the white list through.
  # def home_params
  #   params[:home]
  # end
end
