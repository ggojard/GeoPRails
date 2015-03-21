class AdminUserRoleToBuilding < ActiveRecord::Base
  belongs_to :admin_user_role
  belongs_to :building
end
