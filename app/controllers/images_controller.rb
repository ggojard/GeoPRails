class ImagesController < ApplicationController

#   caches_action :company_image, :cache_path => proc { |c|
#     expires_in 10.minutes, :public => false
#     category = c.params[:id]
#     {:id => category} 
# }

  # caches_action :company_image, :if => Proc.new { |c| result = c.headers["Content-Type"] = 'image/png; charset=UTF-8' if result; result }



  def floor_image
    @s = params[:style]
    if @s == nil
      @s = 'original'
    end
    id = params[:id]
    @f = FloorsImage.where(floor_id:id, style: @s)
    response.headers['Cache-Control'] = "public, max-age=#{12.hours.to_i}"
    response.headers['Content-Type'] = 'image/png'
    response.headers['Content-Disposition'] = 'inline'
    render :text => @f[0].file_contents
  end


  def logo_small
    company = Company.find_by_id(current_admin_user.company_id)
    if !company.nil?
      redirect_to company.image.url(:thumb)
    end
  end

  def logo
    company = Company.find_by_id(current_admin_user.company_id)
    if !company.nil?
      redirect_to company.image.url(:original)
    end
  end


  def company_image
    @s = params[:style]
    if @s == nil
      @s = 'original'
    end
    id = params[:id]
    @f = CompanyImages.where(company_id:id, style: @s)
    response.headers['Cache-Control'] = "public, max-age=#{12.hours.to_i}"
    response.headers['Content-Type'] = 'image/png'
    response.headers['Content-Disposition'] = 'inline'
    # response.headers['Keep-Alive'] = 'timeout=5, max=100'
    
    # render :plain => 'hello', :status =>  200
    render :text => @f[0].file_contents
  end
end
