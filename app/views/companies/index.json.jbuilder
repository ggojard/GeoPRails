json.array!(@companies) do |c|
  json.extract! c, :id, :name, :buildings
  json.url company_url(c, format: :json)
end
