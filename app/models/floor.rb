class Floor < ActiveRecord::Base
  belongs_to :building

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id)
      b.url "/floors/" + self.id.to_s
    end
  end

end
