class AdminUserType < ActiveRecord::Base
  default_scope {order(:name)}
end
