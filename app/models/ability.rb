class Ability
  include CanCan::Ability

  def set_arm user
    $arm ||= {}
    if !user.nil? 
      $arm[user.id] = ArmUser.new(user.id, self)
      puts 'ARM: Setup for (%s), (%s)' % [user.email, $arm[user.id].user_type]
    end
  end


  def initialize(user)
    u_type = 'READ'
    puts 'ARM: Initialize'
    set_arm(user)

    if !user.nil?
      arm_user = $arm[user.id]
      u_type = arm_user.user_type
      # can :read, Building, :id => 56
      # can :read, Building, :id => 1
      # puts tob.building.name
      # arm_user.buildings.each do |tob|
      #   # byebug
      #   if !tob.building.nil?
      #     puts "ARM: User (%s) Can Read : (%s)" % [user.email, tob.building.name]
      #     can :read, Building,:id => tob.building.id
      #     # tob.building.floors.each do |floor|
      #     #   if !floor.nil? 
      #     #     can :read, Floor,:id => floor.id 
      #     #   end
      #     # end
      #   end
      # end
    end

    # user ||= User.new # guest user (not logged in)

    if u_type == 'ADMIN'
      can :manage, :all
    elsif u_type == 'WRITE'
      can :manage, [Item, Organization, Person]
      can :read, [Company]
      # Floor, Building, Room,Affectation, Inventory
      cannot [:manage, :read], [AdminUser, AdminUserType, EvacuationZone, OrganizationType, PersonState, RoomGroundType, RoomType]
    else
      can :read, :all
    end

    # puts 'ROLE %s' % user.admin_user_role.name

    # return user;

    # can :read, Company
    # can :read, Building, :id => 50
    # can :read, Building, :id => 1

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
