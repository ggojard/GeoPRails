class OrganizationsController < GeopController
  def show
    org = {}
    if !current_admin_user.nil?
      arm = $arm[current_admin_user.id]
      u_arm_floors_id = arm.floors_id;

      # query the org
      o = Organization.includes(:rooms => {:floor => :building}).where(:rooms => {floor: u_arm_floors_id}).find_by_id(params[:id])

      # query org to org children
      o_rec = Organization.includes(:organizations => {:rooms => {:floor => :building}}).where(:rooms => {floor_id:u_arm_floors_id}).find_by_id(params[:id])

      org = o.as_json(:include => [{ :rooms => {:include => {:floor => {:include => :building}}}}]) 
      org_rec = o.as_json(:include => [{:organizations=> {:include => { :rooms => {:include => {:floor => {:include => :building}}}}}}])

      org[:organizations] = org_rec['organizations']

    end


    respond_to do |format|
      format.html{
        gon.organization = org;
      }
      format.json{
        render json: org
      }
    end
  end
end
