class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors, :dependent => :destroy
  accepts_nested_attributes_for :floors, :allow_destroy => true

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id)
      b.url "/buildings/" + self.id.to_s
      # b.floors self.floors.each.to_builder
      
      b.floors self.floors do |f|
        b.name f.name
        b.url '/floors/' + f.id.to_s
      end
      # self.floors.each do |f|
      #   b.floors f.to_builder
      # end

    end
  end

end
