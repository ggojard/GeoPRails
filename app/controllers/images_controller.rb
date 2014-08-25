class ImagesController < ApplicationController

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
end
