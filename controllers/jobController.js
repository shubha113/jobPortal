import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { Job } from "../models/jobModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const postJob = catchAsyncError(async (req, res, next) => {
  const {
    title,
    description,
    requirements,
    salary,
    location,
    jobType,
    experience,
    position,
    companyId,
  } = req.body;
  const userId = req.user._id;
  if (
    !title ||
    !description ||
    !requirements ||
    !salary ||
    !location ||
    !jobType ||
    !experience ||
    !position ||
    !companyId
  )
    return next(new ErrorHandler("Please fill all the fields", 400));

  const job = new Job({
    title,
    description,
    requirements: requirements.split(","),
    salary: Number(salary),
    location,
    jobType,
    experienceLevel: experience,
    position,
    company: companyId,
    created_by: userId,
  });

  await job.save();

  res.status(200).json({
    success: true,
    message: "New Job created successfully",
    job,
  });
});

export const getAllJobs = catchAsyncError(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const query = {
    $or: [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ],
  };
  const jobs = await Job.find(query)
    .populate({ path: "company" })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    jobs: jobs || [],
  });
});

export const getJobById = catchAsyncError(async (req, res, next) => {
  const jobId = req.params.id;
  const job = await Job.findById(jobId).populate({ path: "applications" });
  if (!job) return next(new ErrorHandler("No job found", 404));

  res.status(200).json({
    success: true,
    job,
  });
});

export const getAdminJobs = catchAsyncError(async (req, res, next) => {
  const adminId = req.user._id;
  const jobs = await Job.find({ created_by: adminId }).populate({
    path: "company",
  });
  if (!jobs) return next(new ErrorHandler("Jobs not found", 404));
  res.status(200).json({
    success: true,
    jobs,
  });
});
