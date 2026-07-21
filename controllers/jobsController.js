const Job = require('../models/jobs');
const geocoder = require('../utils/geocoder');
const ErrorHandler = require('../utils/errorHandler');
const CatchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFilters = require('../utils/apiFilters');
const path = require('path');
const fs = require('fs');

// Get all jobs
exports.getJobs = CatchAsyncErrors(async (req, res) => {
  const apiFilters = new ApiFilters(Job.find(), req.query).filter().sort().limitFields().searchByQuery().paginate();
  const jobs = await apiFilters.query;

  res.status(200).json({
    success: true,
    middleware: req.variable,
    results: jobs.length,
    data: jobs,
  });
});
// Create new job
exports.createJob = CatchAsyncErrors(async (req, res) => {
  try {
    const savedJob = await new Job({ ...req.body, user: req.user.id }).save();

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: savedJob
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});
// Get jobs within a radius
exports.getJobInRadius = CatchAsyncErrors(async (req, res) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  const earthRadius = 3963.2; // Radius of the Earth in miles or 6378.1 in kilometers
  const radius = distance / earthRadius;

  const jobs = await Job.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs
  });
});
// Update job
exports.updateJob = CatchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }

  if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorHandler('You are not authorized to update this job', 403));
  }

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: updatedJob
  });
});
// Delete job
exports.deleteJob = CatchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }

  const deletedJob = await Job.findByIdAndDelete(req.params.id).select('+applicantsApplied');

  for (const applicant of deletedJob.applicantsApplied) {
    const filePath = path.join(process.env.FILE_UPLOAD_PATH, applicant.resume);
    const fileExists = await fs.exists(filePath);
    if (fileExists) {
      await fs.unlink(filePath, err => {
        if (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Job deleted successfully',
    data: {}
  });
});

exports.getJobById = CatchAsyncErrors(async (req, res, next) => {
  const job = await Job.findOne({_id: req.params.id}).populate({ path: 'user', select: 'name email' });
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

exports.getJob = CatchAsyncErrors(async (req, res, next) => {
  const job = await Job.find({$and: [{_id: req.params.id}, {slug: req.params.slug}]}).populate({ path: 'user', select: 'name email' });
  if (!job || job.length === 0) {
    return next(new ErrorHandler('Job not found', 404));
  }

  res.status(200).json({
    success: true,
    data: job
  });
});

exports.getStats = CatchAsyncErrors(async (req, res) => {
  const stats = await Job.aggregate([
    {
      $match: { $text: { $search: req.params.topic } }
    },
    {
      $group: {
        _id: { $toUpper: '$experience' },
        avgSalary: { $avg: '$salary' },
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: '$positions' },
        minSalary: { $min: '$salary' },
        maxSalary: { $max: '$salary' }
      }
    }
  ]);

  if (stats.length === 0) {
    return res.status(200).json({
      success: false,
      message: 'No stats found for this topic'
    });
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});

exports.applyForAJob = CatchAsyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id).select('+applicantsApplied');
  if (!job) {
    return next(new ErrorHandler('Job not found', 404));
  }

  if (job.lastDate < new Date(Date.now())) {
    return next(new ErrorHandler('You can\'t apply for this job. Deadline has passed', 400));
  }

  if (!req.files) {
    return next(new ErrorHandler('Please upload a file', 400));
  }
    
  if (job?.applicantsApplied.some(applicant => applicant.user.toString() === req.user.id)) {
    return next(new ErrorHandler('You have already applied for this job', 400));
  }

  const file = req.files.file;

  const supportedFiles = /.docs|.docx|.pdf|.txt/;
  if(!supportedFiles.test(path.extname(file.name))) {
    return next(new ErrorHandler('Please upload a file in doc, docx, pdf or txt format', 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorHandler(`Please upload a file less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }
    
  file.name = `resume_${req.user.id}_${job.id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorHandler('Problem with file upload', 500));
    }

    await Job.findByIdAndUpdate(req.params.id, {
      $push: { applicantsApplied: { user: req.user.id, resume: file.name } }
    }, { new: true, runValidators: true, useFindAndModify: false });

    res.status(200).json({
      success: true,
      message: 'Applied for the job successfully'
    });
  });
});