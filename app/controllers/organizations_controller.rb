class OrganizationsController < GeopController
  def show
    o = Organization.includes(:rooms => :floor).find_by_id(params[:id])    
    o.rooms = o.rooms.select{ |r| can? :read, r.floor.building}
    gon.organization = o.as_json(:include => {:rooms => {:include => :floor}})
  end
end
