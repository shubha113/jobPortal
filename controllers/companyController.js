import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { Company } from "../models/companyModel.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";

export const registerCompany = catchAsyncError(async (req, res, next) => {
  const { companyName } = req.body;
  if (!companyName)
    return next(new ErrorHandler("Please fill the company name", 400));
  let company = await Company.findOne({ name: companyName });
  if (company) return next(new ErrorHandler("company name alredy exists", 400));
  company = await Company.create({ name: companyName, userId: req.user._id });
  res.status(201).json({
    success: true,
    message: "Company registered successfully",
    company,
  });
});

export const getCompany = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const companies = await Company.find({ userId });
  if (!companies || companies.length === 0)
    return next(new ErrorHandler("Companies not found", 404));
  res.status(200).json({
    success: true,
    companies,
  });
});

export const getCompanyById = catchAsyncError(async (req, res, next) => {
  const companyId = req.params.id;
  const company = await Company.findById(companyId);
  if (!company) return next(new ErrorHandler("Company not found", 404));
  res.status(200).json({
    success: true,
    company,
  });
});

export const updateCompany = catchAsyncError(async (req, res, next) => {
  const { name, description, website, location } = req.body;
  const file = req.file;
  const fileUri = getDataUri(file);
  const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
  const logo = cloudResponse.secure_url;

  const updateData = { name, description, website, location, logo };
  const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });
  if (!company) return next(new ErrorHandler("Company not found", 404));
  res.status(200).json({
    success: true,
    message: "Company information updated",
  });
});
