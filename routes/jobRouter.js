const express = require('express');
const router = express.Router();
const { getJobs, createJob, getJobInRadius, updateJob, deleteJob, getJob, getStats, applyForAJob, getJobById } = require('../controllers/jobsController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

router.route('/jobs').get(getJobs);
router.route('/jobs/:id').get(getJobById);
router.route('/stats/:topic').get(getStats);
router.route('/jobs/by-slug/:id/:slug').get(getJob);
router.route('/jobs/by-zipcode/:zipcode/:distance').get(getJobInRadius);

router.route('/jobs/new').post(isAuthenticated, authorizeRoles('admin', 'employer'), createJob);

router.route('/jobs/:id')
  .put(isAuthenticated, authorizeRoles('admin', 'employer'), updateJob)
  .delete(isAuthenticated, authorizeRoles('admin', 'employer'), deleteJob);
    
router.route('/jobs/:id/apply').put(isAuthenticated, authorizeRoles('user'), applyForAJob);

module.exports = router;