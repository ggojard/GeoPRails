class ItemQuality < ActiveRecord::Base
  default_scope {order(:rank)}
  after_commit :delete_references_cache
  after_destroy :delete_references_cache
  after_create :delete_references_cache

  def delete_references_cache
    GeoPLibs.delete_references_cache
  end

  has_many :items
  # accepts_nested_attributes_for :items

end
