class PersonState < ActiveRecord::Base
  default_scope {order(:name)}
end
