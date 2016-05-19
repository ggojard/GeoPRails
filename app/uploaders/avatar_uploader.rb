# encoding: utf-8

class AvatarUploader < CarrierWave::Uploader::Base

  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick
  include Cloudinary::CarrierWave


  process :convert => 'png'
  # process :tags => ['post_picture']

  # version :standard do
  #   process :resize_to_fill => [100, 150, :north]
  # end

  version :thumbnail do
    cloudinary_transformation :transformation => [
      {:width => 100, :height => 100, :crop => :thumb, :gravity => :face, :radius => :max}
    ], :secure => true
  end

  version :mini do
    cloudinary_transformation :transformation => [
      {:width => 32, :height => 32, :crop => :thumb, :gravity => :face, :radius => :max},
    ], :secure => true
  end


  def public_id
    if ENV['SURFY_DEDICATED_CLOUDINARY'].nil?
      hash = Digest::MD5.hexdigest("#{model.class.to_s.underscore}_#{model.id}")
      return "#{GeopController.PlatformName}/#{model.class.to_s.underscore}/#{hash}"
    end
  end

  # Choose what kind of storage to use for this uploader:
  # storage :file
  # storage :fog

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  # def store_dir
  #   "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  # end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process :scale => [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process :resize_to_fit => [50, 50]
  # end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_white_list
  #   %w(jpg jpeg gif png)
  # end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

end
