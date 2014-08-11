class RoomType < ActiveRecord::Base

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id)
    end
  end

  default_scope {order(:name)}
end
