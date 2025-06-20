const express = require('express');
// const jwt = require('jsonwebtoken');
const router = express.Router();
const userController = require('./userController');
// require('../../../config/passportConfigGoogle')

router.post('/register', userController.register);


router.post('/verify', userController.verifyOTP);


router.post('/login', userController.login);

module.exports = router;