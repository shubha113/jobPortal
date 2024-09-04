import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please enter yoir name"],
    },
    email: {
      type: String,
      required: [true, "Please enter yoir email"],
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please enter yoir phone number"],
    },
    password: {
      type: String,
      required: [true, "Enter your password"],
      minLength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },
    profile: {
      bio: {
        type: String,
      },
      skills: [
        {
          type: String,
        },
      ],
      resume: {
        type: String,
      },
      resumeOriginalName: {
        type: String,
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      profilePhoto: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};
export const User = mongoose.model("User", userSchema);
