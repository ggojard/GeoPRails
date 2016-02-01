class AdminUserRole < ActiveRecord::Base
  default_scope {order(:name)}
  after_update Ability.reset_arm

  has_many :admin_user_role_to_buildings
  has_many :buildings, :through => :admin_user_role_to_buildings
  accepts_nested_attributes_for :admin_user_role_to_buildings, :allow_destroy => true
  accepts_nested_attributes_for :buildings, :allow_destroy => true

end
