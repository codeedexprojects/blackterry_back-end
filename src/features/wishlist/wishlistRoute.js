const express = require('express');
const wishlistController = require('./wishlistController');
const router = express.Router();

// Add product to wishlist
router.post('/', wishlistController.addToWishlist);

// Get wishlist by user ID
router.get('/:userId', wishlistController.getWishlistByUserId);

// Remove product from wishlist
router.delete('/', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/:userId', wishlistController.clearWishlist);

module.exports = router;