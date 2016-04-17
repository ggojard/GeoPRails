class AdminUserRoleToBuilding < ActiveRecord::Base
  belongs_to :admin_user_role
  belongs_to :building
  after_save Ability.reset_arm

end


