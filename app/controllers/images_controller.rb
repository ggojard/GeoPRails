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
    render :text => @f[0].file_contents
  end

  def logo_small
    company = Company.find_by_id(current_admin_user.company_id)
    if !company.nil?
      redirect_to company.image.url(:thumb)
    end
  end

  def logo
    # @img_arm ||= $arm[current_admin_user.id]
    $company_logo_content ||= get_company_image_content(current_admin_user.id, 'original')
    render :text => $company_logo_content, :content_type => 'image/png', :disposition => 'inline', :cache => true
  end

  def company_image
    id = params[:id]
    render :text => get_company_image_content(id, params[:style])
  end

  private

  def get_company_image_content(id, style)
    style = params[:style]
    if style == nil
      style = 'original'
    end
    f = CompanyImages.where(company_id:id, style: style)
    response.headers['Cache-Control'] = "public, max-age=#{12.hours.to_i}"
    response.headers['Content-Type'] = 'image/png'
    response.headers['Content-Disposition'] = 'inline'
    return f[0].file_contents
  end

  def get_company_logo_path
    company = Company.find_by_id(current_admin_user.company_id)
    if !company.nil?
      return company.image.url(:original)
    end
  end

end
