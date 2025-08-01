const express = require('express');
const router = express.Router();
const userController = require('./userController');

router.post('/register', userController.register);


router.post('/verify', userController.verifyOTP);


router.post('/login', userController.login);

module.exports = router;