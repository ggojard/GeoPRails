class WorkplaceAffectation < ActiveRecord::Base
  belongs_to :person
  belongs_to :workplace
end
