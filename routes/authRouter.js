const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { isAuthenticated } = require('../middleware/auth');

router.get('/logout', isAuthenticated, authController.logoutUser);

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/forgotpassword', authController.sendResetEmail);

router.put('/resetpassword/:token', authController.resetPassword);

module.exports = router;