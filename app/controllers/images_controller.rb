class ImagesController < GeopController
  # caches_page :logo, :logo_small, :company_image, :floor_image

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
    if !@f[0].nil?
      render :text => @f[0].file_contents
    else
      redirect_to "/assets/logo-surfy-h42.png"
    end
  end

  def logo_small
    company = Company.find_by_id(current_admin_user.company_id)
    if !company.nil?
      return redirect_to company.logo.url(:small)
    end
    return redirect_to "/assets/logo-surfy-h42.png"
  end

  def logo
    company = Company.find_by_id(current_admin_user.company_id)
    if !company.nil? && !company.logo.nil? && !company.logo.url(:small).nil?
      return redirect_to company.logo.url(:small)
    end
    return redirect_to "/assets/logo-surfy-h42.png"
  end

end
