class AdminUser < ActiveRecord::Base
  belongs_to :company
  belongs_to :admin_user_type
  belongs_to :admin_user_role  

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, 
         :recoverable, :rememberable, :trackable, :validatable
end
