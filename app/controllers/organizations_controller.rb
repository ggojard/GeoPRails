class OrganizationsController < GeopController
  def show
    o = Organization.includes([:organizations => {:rooms => {:floor => :building}}, :rooms => {:floor => :building}]).find_by_id(params[:id])    
    gon.organization = o.as_json(:include => [{:organizations=> {:include => { :rooms => {:include => {:floor => {:include => :building}}}}}} ,{ :rooms => {:include => {:floor => {:include => :building}}}}])
  end
end
