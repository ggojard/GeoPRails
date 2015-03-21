module ActiveAdminCanCan
  def active_admin_collection
    super.accessible_by current_ability
  end
end
