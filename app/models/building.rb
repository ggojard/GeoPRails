class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors
  accepts_nested_attributes_for :floors, :allow_destroy => true

  def url
    "/buildings/%d" % self.id
  end

  default_scope {order(:name)}
end
