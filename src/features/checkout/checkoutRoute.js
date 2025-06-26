const express = require('express');
const router = express.Router();
const checkoutController = require('./checkoutController')
const jwtVerify=require('../../middleware/jwtMiddleware')

router
.route('/')
.post(jwtVerify(['user']),  checkoutController.createCheckout);

router
.route('/:id')
.get(jwtVerify(['user']), checkoutController.getCheckoutById)
.delete(jwtVerify(['user']), checkoutController.deletCheckout);

module.exports = router;
