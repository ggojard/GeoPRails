class Room < ActiveRecord::Base
  belongs_to :room_type
  belongs_to :floor


  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id, :room_type, :floor, :points)
      b.url "/rooms/" + self.id.to_s
      # b.rooms self.rooms.collect { |b| b.to_builder.attributes! }
    end
  end



end
