/**
 * Role-Based Access Control (RBAC) Middleware
 */

export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Role Definitions and Permissions
 */
export const ROLES = {
  ADMIN: 'admin',
  CANTEEN_MANAGER: 'canteen_manager',
  STAFF: 'staff',
  STUDENT: 'student',
  FACULTY: 'faculty'
};

export const PERMISSIONS = {
  // Admin permissions
  [ROLES.ADMIN]: [
    'view_all_orders',
    'manage_users',
    'manage_canteens',
    'manage_staff',
    'view_reports',
    'manage_settings',
    'manage_permissions',
    'view_activity_logs',
    'manage_roles'
  ],

  // Canteen Manager permissions
  [ROLES.CANTEEN_MANAGER]: [
    'manage_menu_items',
    'view_canteen_orders',
    'manage_inventory',
    'view_canteen_reports',
    'manage_staff_in_canteen',
    'view_canteen_analytics'
  ],

  // Staff permissions
  [ROLES.STAFF]: [
    'view_assigned_orders',
    'update_order_status',
    'view_menu_items',
    'update_inventory'
  ],

  // Student permissions
  [ROLES.STUDENT]: [
    'view_menu',
    'create_order',
    'view_own_orders',
    'cancel_own_order',
    'leave_feedback'
  ],

  // Faculty permissions
  [ROLES.FACULTY]: [
    'view_menu',
    'create_order',
    'view_own_orders'
  ]
};

/**
 * Permission Checker Utility
 */
export const hasPermission = (userRole, requiredPermission) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes(requiredPermission);
};

/**
 * Specific Role Check Middleware
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

export const requireCanteenManager = (req, res, next) => {
  console.log('RBAC Check - User role:', req.user?.role);
  console.log('RBAC Check - User ID:', req.user?._id);
  
  if (![ROLES.ADMIN, ROLES.CANTEEN_MANAGER].includes(req.user?.role)) {
    console.log('RBAC Check - FAILED: Role not allowed');
    return res.status(403).json({
      success: false,
      message: 'Manager access required'
    });
  }
  
  console.log('RBAC Check - PASSED');
  next();
};

export const requireStaffOrHigher = (req, res, next) => {
  const allowedRoles = [ROLES.ADMIN, ROLES.CANTEEN_MANAGER, ROLES.STAFF];
  if (!allowedRoles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
  next();
};
