const express = require('express');
const addressController = require('./addressController')
const router = express.Router();
const jwtVerify=require('../../middleware/jwtMiddleware')

// Add a new address
router.post('/', jwtVerify(['user']), addressController.addAddress);

// Get all addresses for a user
router.get('/:userId', jwtVerify(['user']), addressController.getAddressesByUserId);

// Update an address by ID
router.patch('/:id', jwtVerify(['user']), addressController.updateAddress);

// Delete an address by ID
router.delete('/:id', jwtVerify(['user']), addressController.deleteAddress);

module.exports = router;