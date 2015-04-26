class OrganizationsController < GeopController
  def show
    o = Organization.includes(:rooms => :floor).find_by_id(params[:id])    
    o.rooms = o.rooms.select{ |r| can? :read, 
      if  !r.floor.nil?  
        r.floor.building
      else
        nil
      end

    }
    gon.organization = o.as_json(:include => {:rooms => {:include => :floor}})
  end
end
