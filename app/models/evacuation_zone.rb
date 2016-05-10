class EvacuationZone < ActiveRecord::Base
  require 'geop_libs'

  after_commit :delete_references_cache
  after_destroy :delete_references_cache
  after_create :delete_references_cache

  def delete_references_cache
    GeoPLibs.delete_references_cache
  end

  def color_rgba_with_opacity
    GeoPLibs.color_rgba_with_opacity self.color
  end

  default_scope {order(:name)}
end
