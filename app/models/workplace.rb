class Workplace < ActiveRecord::Base
  belongs_to :room

  has_many :workplace_affectations, :dependent => :destroy
  accepts_nested_attributes_for :workplace_affectations, :allow_destroy => true
  has_many :people, :through => :workplace_affectations
  accepts_nested_attributes_for :people, :allow_destroy => true


end
