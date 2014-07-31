class Item < ActiveRecord::Base
  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :description, :code)
    end
  end
end
