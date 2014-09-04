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
    "/floors/%d" % self.id.to_s
  end

  # def img?
  #   @upload_content_type =~ %r{^(image|(x-)?application)/(bmp|gif|jpeg|jpg|pjpeg|png|x-png)$}
  # end

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id, :image, :map_scale_x1, :map_scale_y1, :map_scale_x2, :map_scale_y2, :map_scale_length, :image_dimensions, :fullname, :level)
      b.url self.url
      # b.rooms self.rooms
      # b.rooms self.rooms.includes(:room_type, :room_ground_type, :evacuation_zone, :organization, :affectations).collect { |r| r.to_builder_with_affectations.attributes! }
      # if !self.building_id.nil?
      #   @o = Building.find_by_id(self.building_id)
      #   b.building  @o.to_builder_simple_floor.attributes!
      # else
      #   b.building nil
      # end
    end
  end

  def to_builder_search
    Jbuilder.new do |b|
      b.(self, :fullname)
      b.url '/floors/' +  self.id.to_s
    end
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
