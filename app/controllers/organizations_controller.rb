class OrganizationsController < GeopController
  def show
    org = {}
    o_rec = nil
    if !current_admin_user.nil?
      arm = $arm[current_admin_user.id]
      u_arm_floors_id = arm.floors_id;

      puts 'floors'.blue
      # puts u_arm_floors_id

      # query the org
      o = Organization.includes(:rooms => {:floor => :building}).where(:rooms => {floor: u_arm_floors_id}).find_by_id(params[:id])
  

      puts o

      if o.nil?
        o = Organization.find_by_id(params[:id])
      end

      org = o.as_json(:include => [{ :rooms => {:include => {:floor => {:include => :building}}}}], :methods => [:url]) 

      # query org to org children
      o_rec = Organization.includes(:organizations => {:rooms => {:floor => :building}}).where(:rooms => {floor_id:u_arm_floors_id}).find_by_id(params[:id])
      org_rec = o_rec.as_json(:include => [{:organizations => {:include => { :rooms => {:include => {:floor => {:include => :building}}}},  :methods => [:url]}}])
      if !org.nil? && !org_rec.nil?
        org[:organizations] = org_rec['organizations']
      else
        org[:organizations] = []
      end 

    end


    respond_to do |format|
      format.json{
        render json: org
      }
    end
  end
end
