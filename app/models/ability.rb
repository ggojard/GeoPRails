class Ability
  include CanCan::Ability

  def initialize(user)

    # u_type = 'READ'
    u_type = 'ADMIN'

    if !user.nil?
      if !user.admin_user_type.nil?
        # u_type = user.admin_user_type.code
      end

      puts 'Abilities For User : %s (%s)' % [user.email, u_type]
      # puts tob.building.name
      # user.admin_user_role.admin_user_role_to_buildings.each do |tob|
      #   can :read, Building,:id => tob.building.id
      # end

    end
    # user ||= User.new # guest user (not logged in)

    # u_type = 'A'



    if u_type == 'ADMIN'
      can :manage, :all
    elsif u_type == 'WRITE'
      can :manage, [Affectation, Inventory, Item, Organization, Person, Room]
      can :read, [Company, Floor, Building]
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
