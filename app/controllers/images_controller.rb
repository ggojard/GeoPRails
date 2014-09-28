class ImagesController < ApplicationController

  # caches_action :company_image


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
    response.headers['Content-Disposition'] = 'inline'
    response.headers['Content-Type'] = 'image/png'
    render :text => @f[0].file_contents, :content_type => 'image/png'
  end
end
