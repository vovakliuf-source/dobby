const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { isAuthenticated } = require('../middleware/auth');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', isAuthenticated, authController.logoutUser);
router.post('/forgotpassword', authController.sendResetEmail);
router.put('/resetpassword/:token', authController.resetPassword);

module.exports = router;