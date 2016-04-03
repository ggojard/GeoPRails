class RoomGroundType < ActiveRecord::Base
  default_scope {order(:name)}

end
