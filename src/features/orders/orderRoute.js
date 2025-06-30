const express = require('express');
const router = express.Router();
const orderController = require('./orderController');
const jwtVerify=require('../../middleware/jwtMiddleware')


// intiate an order
// router.post('/create', jwtVerify(['user']), orderController.initiateOrder);

// place an order
router.post('/confirm', jwtVerify(['user']), orderController.placeOrder)

// Get orders for a user
router.get('/user/:userId', jwtVerify(['user']), orderController.getUserOrders);

// Get order details by ID
router.get('/:orderId', jwtVerify(['user','admin']), orderController.getOrderById);

// router.post('/invoice/:orderId', orderController.updateOrderStatus)

router.post('/cancel/:orderId', jwtVerify(['user']), orderController.cancelOrder)

router.post('/return/:orderId', jwtVerify(['user']), orderController.requestReturn)




module.exports = router;
