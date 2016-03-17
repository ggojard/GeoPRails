class Company < ActiveRecord::Base
  after_update Ability.reset_arm

  has_many :buildings
  accepts_nested_attributes_for :buildings, :allow_destroy => true

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :admin_users
  accepts_nested_attributes_for :admin_users, :allow_destroy => true

  mount_uploader :logo, LogoUploader

  def url
    '/#/companies/%d' % self.id
  end

  def logo_url
    if !self.logo?
      image_tag(self.logo.url(:small))
    else
      return nil
    end
  end

end
