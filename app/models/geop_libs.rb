class GeoPLibs

  def self.delete_references_cache
    Rails.cache.delete('references')
  end

  def self.color_rgba_with_opacity input_color
    c = Color::RGB.by_hex(input_color)
    return c.css_rgba(0.69).to_s
  end

end