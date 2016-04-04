class Ability
  include CanCan::Ability

  def set_arm user
    $arm ||= {}
    if !user.nil?
      $arm[user.id] = ::ArmUser.new(user.id, self)
      puts 'ARM: Setup for (%s), (%s)' % [user.email, $arm[user.id].user_type]
    end
  end

  def self.reset_arm
    folders = Dir.glob("/tmp/**/tmp/cache/")
    puts ('TRY RESET ARM (%d)' % folders.count).red

    # if folders.count > 0
      puts 'CACHE CLEAR'.green
      Rails.cache.clear
    # end
  end


  # def marshal_dump
  #   #blocks cannot be cached
  #   @rules.reject{|rule| rule.instance_variable_get :@block }.map{|rule| Marshal.dump(rule) }
  # end
  # def marshal_load array
  #   #blocks cannot be cached, so blocks must be re-defined
  #   can :read, Comment do |comment|
  #     comment.length > 100
  #   end
  #   @rules += array.map{|rule| Marshal.load(rule) }
  # end


  def initialize(user)
    u_type = 'READ'
    puts 'ARM: Initialize'
    set_arm(user)

    if !user.nil?
      arm_user = $arm[user.id]
      u_type = arm_user.user_type
    end

    # user ||= User.new # guest user (not logged in)

    if u_type == 'ADMIN'
      can :manage, :all
    elsif u_type == 'WRITE'
      can :manage, [Item, Organization, Person]
      can :read, [Company]
      # Floor, Building, Room, Affectation, Inventory
      cannot [:manage, :read], [AdminUser, AdminUserType, EvacuationZone, OrganizationType, PersonState, RoomGroundType, RoomType]
    else
      can :read, :all
    end

    # puts 'ROLE %s' % user.admin_user_role.name

    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end
    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/ryanb/cancan/wiki/Defining-Abilities

  end
end
