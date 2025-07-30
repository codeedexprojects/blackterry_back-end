const express = require('express');
const router = express.Router();
const userController = require('./userManagementController')
const jwtVerify=require('../../middleware/jwtMiddleware')


router
.route('/')
.get(jwtVerify(['admin']), userController.getAllUsers);

router
.route('/:userId')
.get(jwtVerify(['admin']), userController.getUserById)
.patch(jwtVerify(['admin']), userController.toggleUserStatus)
.delete(jwtVerify(['admin']), userController.deleteUser)

module.exports = router;
