class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors, :dependent => :destroy
  accepts_nested_attributes_for :floors, :allow_destroy => true
end
