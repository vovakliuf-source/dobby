const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserPassword, updateUserProfile, deleteUser, getAppliedJobs, getPublishedJobs, getAllUsers, deleteUserByAdmin } = require('../controllers/userController');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

router.route('/profile').get(isAuthenticated, getUserProfile);
router.route('/jobs/applied').get(isAuthenticated, authorizeRoles('user'), getAppliedJobs);
router.route('/jobs/published').get(isAuthenticated, authorizeRoles('employer'), getPublishedJobs);
router.route('/users').get(isAuthenticated, authorizeRoles('admin'), getAllUsers);

router.route('/password/update').put(isAuthenticated, updateUserPassword);
router.route('/profile/update').put(isAuthenticated, updateUserProfile);

router.route('/profile/delete').delete(isAuthenticated, deleteUser)
router.route('/user/:id').delete(isAuthenticated, authorizeRoles('admin'), deleteUserByAdmin);

module.exports = router;