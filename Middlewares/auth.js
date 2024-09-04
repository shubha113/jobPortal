import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/userModel.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandler("User not authenticated", 401));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    if (!req.user) {
      // If user not found, consider it unauthorized
      return next(new ErrorHandler("Not Logged In", 401));
    }
    next();
  } catch (error) {
    // Token verification failed
    return next(new ErrorHandler("Not Logged In", 401));
  }
});
