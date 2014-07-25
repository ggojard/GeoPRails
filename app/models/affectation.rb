class Affectation < ActiveRecord::Base
  # attr_accessible :person_id, :room_id
  belongs_to :person
  belongs_to :room

  def to_builder
    Jbuilder.new do |b|
      b.(self, :room)
      @p = Person.find(self.person_id)
      b.person  @p.to_builder.attributes!
    end
  end

  def to_builder_room
    Jbuilder.new do |b|
      b.(self, :room)
      @r = Room.find(self.room_id)
      b.room  @r.to_builder_no_affectations.attributes!
    end
  end  
end
