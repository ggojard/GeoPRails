class Company < ActiveRecord::Base
  has_many :buildings, :dependent => :destroy
  accepts_nested_attributes_for :buildings, :allow_destroy => true
end
