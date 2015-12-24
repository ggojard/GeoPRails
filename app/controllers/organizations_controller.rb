class OrganizationsController < GeopController
  def show
    o = Organization.includes(:rooms => :floor).find_by_id(params[:id])    
    gon.organization = o.as_json(:include => {:rooms => {:include => {:floor => {:include => :building}}}})
  end
end
