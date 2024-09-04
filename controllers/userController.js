import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { fullname, email, phoneNumber, password, role } = req.body;

  if (!fullname || !email || !phoneNumber || !password || !role) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }

  const file = req.file;
  const fileUri = getDataUri(file);
  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exists", 409));

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    fullname,
    email,
    phoneNumber,
    password: hashedPassword,
    role,
    profile: {
      profilePhoto: cloudResponse.secure_url,
    },
  });

  sendToken(res, user, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role)
    return next(new ErrorHandler("Please enter all the fields", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Incorrect Email or pasword", 401));
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch)
    return next(new ErrorHandler("Incorrect email or password", 401));
  if (role !== user.role)
    return next(
      new ErrorHandler("Account doesn't exist with current role", 401)
    );
  sendToken(res, user, `Welcome back, ${user.fullname}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { fullname, email, phoneNumber, bio, skills } = req.body;
  const file = req.file;

  let user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (fullname) user.fullname = fullname;
  if (email) user.email = email;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (bio) user.profile.bio = bio;

  let skillsArray = skills;
  if (typeof skills === "string") {
    skillsArray = skills.split(",");
  }
  if (skillsArray) user.profile.skills = skillsArray;

  // Resume logic
  if (file) {
    try {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.v2.uploader.upload(
        fileUri.content
      );

      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalName;
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    user,
  });
});
