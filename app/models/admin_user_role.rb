class AdminUserRole < ActiveRecord::Base
  default_scope {order(:name)}
end
