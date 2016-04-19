class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors, -> {order(:level)}, :dependent => :destroy
  accepts_nested_attributes_for :floors, :allow_destroy => true
  after_commit :reset_arm
  after_destroy :reset_arm
  after_create :reset_arm

  has_many :admin_user_role_to_buildings
  has_many :admin_user_roles, :through => :admin_user_role_to_buildings
  accepts_nested_attributes_for :admin_user_role_to_buildings, :allow_destroy => true
  accepts_nested_attributes_for :admin_user_roles, :allow_destroy => true

  def reset_arm
    Ability.reset_arm
  end

  def url
    "/#/buildings/%d" % self.id
  end

  default_scope {order(:name)}
end
