class Room < ActiveRecord::Base
  belongs_to :room_type
  belongs_to :floor
  belongs_to :organization




  def to_builder

    Jbuilder.new do |b|
      b.(self, :name, :id, :room_type, :floor, :points)
      b.url "/rooms/" + self.id.to_s
      # b.org self.organization_id
      if self.organization_id != nil
        @o = Organization.find(self.organization_id)
        b.organization  @o.to_builder.attributes!
      else
        b.organization nil
      end
      # b.rooms self.rooms.collect { |b| b.to_builder.attributes! }
    end
  end



end
