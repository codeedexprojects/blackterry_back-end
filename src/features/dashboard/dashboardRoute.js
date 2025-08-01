const express = require('express');
const router = express.Router();
const DashboardController = require('./dashboardController')
const jwtVerify = require('../../middleware/jwtMiddleware')
const multer=require('../../middleware/multerMiddleware')



// Get all products
router.get('/view-Counts',jwtVerify(['admin']), DashboardController.getStats);

// get sales graph:filter(year,month,place)
router.get('/view-graph',jwtVerify(['admin']),DashboardController.getMonthlyRevenue)

//get recent order:filter(month)
router.get('/view-recent/orders',jwtVerify(['admin']),DashboardController.getRecentOrders)



module.exports = router;