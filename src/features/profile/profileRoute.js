const express = require('express');
const router = express.Router();
const profileController = require('./profileController');
const jwtVerify=require('../../middleware/jwtMiddleware')


// Get user profile
router.get('/:userId', jwtVerify(['user']), profileController.getProfile);

// Update user profile
router.patch('/:userId', jwtVerify(['user']), profileController.updateProfile);

module.exports = router;