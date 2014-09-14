class Company < ActiveRecord::Base

  has_many :buildings
  accepts_nested_attributes_for :buildings, :allow_destroy => true

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :admin_users
  accepts_nested_attributes_for :admin_users, :allow_destroy => true


  has_attached_file :image,:styles => { :thumb => "42x42#" }, :storage => :database, :database_table => 'company_images'
  validates_attachment :image, content_type: { content_type:     ["image/png"] }


  def url
    '/companies/%d' % self.id
  end

end
