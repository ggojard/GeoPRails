class Person < ActiveRecord::Base
  belongs_to :room
  belongs_to :person_state
  belongs_to :organization


  has_many :affectations
  has_many :rooms, :through => :affectations
  accepts_nested_attributes_for :rooms, :allow_destroy => true
  accepts_nested_attributes_for :affectations, :allow_destroy => true

  def fullname
    if !self.nil?
      self.firstname + ' ' + self.lastname
    end
  end

  def url
    '/people/%d' % self.id
  end

  def name
    self.fullname
  end

  def format_phone (a)
    if a.present?
      a.gsub(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '\1 \2 \3 \4 \5')
    end
  end

  def format_telephone
    format_phone self.telephone
  end

  def format_cellphone
    format_phone self.cellphone
  end

  default_scope {order(:lastname)}

end
