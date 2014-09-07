class Floor < ActiveRecord::Base
  belongs_to :building
  has_many :rooms
  accepts_nested_attributes_for :rooms

  has_attached_file :image,:styles => { :thumb => "200x200#" }, :storage => :database, :database_table => 'floors_images'
  validates_attachment :image, content_type: { content_type:     ["image/png"] }
  before_save :extract_dimensions
  serialize :image_dimensions

  def fullname
    self.name + " < " + self.building.name
  end

  def url 
    "/floors/%d" % self.id
  end
  def extract_dimensions
    tempfile = image.queued_for_write[:original]
    unless tempfile.nil?
      geometry = Paperclip::Geometry.from_file(tempfile)
      self.image_dimensions = { :w => geometry.width.to_i,  :h => geometry.height.to_i}.to_json
    end
  end

  default_scope {order(:level)}
end
