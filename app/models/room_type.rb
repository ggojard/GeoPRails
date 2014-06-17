class RoomType < ActiveRecord::Base

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id)
      # b.url "/rooms/" + self.id.to_s
    end
  end

end
