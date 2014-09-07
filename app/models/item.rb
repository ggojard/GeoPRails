class Item < ActiveRecord::Base
  default_scope {order(:name)}
end
