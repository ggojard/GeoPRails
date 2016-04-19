class AdminUserRoleToBuilding < ActiveRecord::Base
  belongs_to :admin_user_role
  belongs_to :building
  after_commit :reset_arm

  def reset_arm
    Ability.reset_arm
  end 
end


