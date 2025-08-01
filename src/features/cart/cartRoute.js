const express = require('express');
const cartController = require('./cartController')
const router = express.Router();
const jwtVerify=require('../../middleware/jwtMiddleware')


// Cart routes

router.post('/add', jwtVerify(['user']), cartController.addToCart);
router.get('/view-cart/:userId', jwtVerify(['user']), cartController.getCartByUserId);
router.delete('/remove', jwtVerify(['user']), cartController.removeFromCart);
router.patch('/update', jwtVerify(['user']), cartController.updateCartItemQuantity);
router.delete('/clear/:userId', jwtVerify(['user']), cartController.clearCart);

// router.post('/applyCoupon',jwtVerify(['user']),cartController.applyCouponToCart)
// router.post("/remove-coupon",jwtVerify(['user']), cartController.removeCouponFromCart);


module.exports = router;