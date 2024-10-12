import { User } from "../models/userSchema.js";
import jwt from "jsonwebtoken"
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.token;
    
    
    if (!token)
        return next(new ErrorHandler("Please login to access this route", 401))
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    //console.log(token);
    next();
})

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role} not allowed to access this resource`, 403))
        }
       
        next();
    }
}

