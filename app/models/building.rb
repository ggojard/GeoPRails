class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors
  accepts_nested_attributes_for :floors, :allow_destroy => true

  def extract_json (b)
      b.(self, :name, :id)
      b.url "/buildings/" + self.id.to_s
  end


  def to_builder_simple
    Jbuilder.new do |b|
      extract_json b
      b.floors self.floors
    end
  end

  def to_builder_simple_floor
    Jbuilder.new do |b|
      extract_json b
    end
  end

  def to_builder
    Jbuilder.new do |b|
      extract_json b
      b.floors self.floors.includes(:rooms).collect { |b| b.to_builder.attributes! }
    end
  end
  default_scope {order(:name)}
end
