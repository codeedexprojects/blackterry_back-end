const express = require('express');
const wishlistController = require('./wishlistController');
const router = express.Router();
const jwtVerify=require('../../middleware/jwtMiddleware')


// Add product to wishlist
router.post('/', jwtVerify(['user']), wishlistController.addToWishlist);

// Get wishlist by user ID
router.get('/:userId', jwtVerify(['user']), wishlistController.getWishlistByUserId);

// Remove product from wishlist
router.delete('/', jwtVerify(['user']), wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/:userId', jwtVerify(['user']), wishlistController.clearWishlist);

module.exports = router;