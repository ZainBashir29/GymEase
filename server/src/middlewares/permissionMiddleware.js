import ApiError from "../utils/ApiError.js";

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (req.user.adminType === "system_admin") {
      return next();
    }

    const hasExplicitPermission = req.user.permissions && req.user.permissions.includes(permission);
    const hasStorePermission = (permission === "manage_products" || permission === "manage_orders") && req.user.permissions && req.user.permissions.includes("manage_store");

    if (!hasExplicitPermission && !hasStorePermission) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  };
};

export const requirePermissionIfAdmin = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (req.user.role !== "Admin") {
      return next();
    }

    if (req.user.adminType === "system_admin") {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  };
};

export const requireSystemAdmin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (req.user.adminType !== "system_admin") {
    throw new ApiError(403, "Only the System Admin can perform this action");
  }

  next();
};
