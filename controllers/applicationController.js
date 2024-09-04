import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { Application } from "../models/applicationModel.js";
import { Job } from "../models/jobModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const applyJob = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const jobId = req.params.id;
  if (!jobId) return next(new ErrorHandler("Job id is required", 400));
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: userId,
  });
  if (existingApplication)
    return next(new ErrorHandler("You have already applied for this job", 400));
  const job = await Job.findById(jobId);
  if (!job) return next(new ErrorHandler("Job not found", 404));
  const newApplication = await Application.create({
    job: jobId,
    applicant: userId,
  });
  job.applications.push(newApplication._id);
  await job.save();
  res.status(200).json({
    success: true,
    message: "Thank you for applying",
  });
});

export const getAppliedJobs = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const application = await Application.find({ applicant: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "job",
      options: { sort: { createdAt: -1 } },
      populate: { path: "company", options: { sort: { createdAt: -1 } } },
    });
  if (!application) return next(new ErrorHandler("No applications", 404));
  res.status(200).json({
    success: true,
    application,
  });
});

export const getApplicants = catchAsyncError(async (req, res, next) => {
  const jobId = req.params.id;
  const job = await Job.findById(jobId).populate({
    path: "applications",
    options: { sort: { createdAt: -1 } },
    populate: { path: "applicant" },
  });
  if (!job) return next(new ErrorHandler("Job not found", 404));
  res.status(200).json({
    success: true,
    job,
  });
});

export const updateStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  const applicationId = req.params.id;
  if (!status) return next(new ErrorHandler("Status is required", 400));
  const application = await Application.findOne({ _id: applicationId });
  if (!application) return next(new ErrorHandler("Application not found", 404));
  application.status = status.toLowerCase();
  await application.save();
  res.status(200).json({
    success: true,
    message: "Status updated successfully",
  });
});
