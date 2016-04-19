class Company < ActiveRecord::Base
  after_commit :reset_arm
  after_destroy :reset_arm
  after_create :reset_arm

  has_many :buildings
  accepts_nested_attributes_for :buildings, :allow_destroy => true

  has_many :organizations
  accepts_nested_attributes_for :organizations, :allow_destroy => true

  has_many :admin_users
  accepts_nested_attributes_for :admin_users, :allow_destroy => true

  mount_uploader :logo, LogoUploader

  def reset_arm
    Ability.reset_arm
  end

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
