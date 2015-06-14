class Affectation < ActiveRecord::Base
  # attr_accessible :person_id, :room_id
  belongs_to :person
  belongs_to :room



end
