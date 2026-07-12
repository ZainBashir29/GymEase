import ApiError from "../utils/ApiError.js";

const role = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(400, "Unauthorized request");
        }

        if(!roles.includes(req.user.role)) {
            throw new ApiError(400, "Access denied");
        }

        next();
    }
}

export default role;