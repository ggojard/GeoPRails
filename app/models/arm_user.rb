class ArmUser
  attr_accessor :buildings_id, :floors_id, :user_type, :company

  def initialize user_id, ability
    @user_type = nil
    @buildings_id = []
    @floors_id = []
    @company = nil

    db_user ||= AdminUser.includes([{:admin_user_role => [:admin_user_role_to_buildings => [:building => :floors]]}, :admin_user_type]).find_by_id(user_id)
    @user_type ||= get_user_type(db_user)
    puts "ARM: ?? User (%d) Type is (%s)" % [user_id, @user_type]
    setup_cancan(db_user, ability)
    # @db_user = db_user
  end


  private

  def setup_cancan db_user, ability
    puts 'ARM: Abilities For User : %s (%s)' % [db_user.email, @user_type]
    if !db_user.nil? && !db_user.admin_user_role.nil?
      db_user.admin_user_role.admin_user_role_to_buildings.each do |tob|
        if !tob.building.nil?
          puts "ARM: User (%s) Can Read Building : (%s)" % [db_user.email, tob.building.name]
          buildings_id << tob.building.id
          ability.can :read, Building,:id => tob.building.id
          tob.building.floors.each do |floor|
            if !floor.nil?
              floors_id << floor.id
              if (@user_type == 'READ')
                ability.can :read, Floor,:id => floor.id
                ability.can :read, Room, :floor_id => floor.id
              elsif @user_type == 'WRITE'
                ability.can :manage, Floor,:id => floor.id
                ability.can :manage, Room, :floor_id => floor.id
                # ability.can :manage, Affectation, Affectation do |a|
                #   !a.room.nil? and a.room.floor_id == floor.id
                # end
                # ability.can :manage, Inventory, Inventory do |i|
                #   !i.room.nil? and i.room.floor_id == floor.id
                # end
              end
            end
          end
        end
      end
    end
  end

  def get_user_type user
    if user.nil?
      return 'READ'
    end
    user_id = user.id
    puts "Get User Type For User Id (%d)" % user_id
    if user_id == 0
      return 'READ'
    end
    if !user.nil?
      if !user.admin_user_type.nil?
        return user.admin_user_type.code
      end
      if user.email == "admin@example.com"
        puts 'User is a Special User.'
        return 'ADMIN'
      end
    end
    return 'READ'
  end
end
