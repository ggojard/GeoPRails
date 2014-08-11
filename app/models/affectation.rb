class Affectation < ActiveRecord::Base
  # attr_accessible :person_id, :room_id
  belongs_to :person
  belongs_to :room

  def to_builder
    Jbuilder.new do |b|
      b.(self, :room)
      p = Person.find_by_id(self.person_id)
      if p.present? do
        b.person  p.to_builder.attributes!
      end
    end
  end

  def to_builder_room
    Jbuilder.new do |b|
      b.(self, :room)
      r = Room.find_by_id(self.room_id)
      if r.present?
        b.room  r.to_builder_no_affectations.attributes!
      end
    end
  end
end
