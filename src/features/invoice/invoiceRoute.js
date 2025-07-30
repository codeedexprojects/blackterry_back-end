const express = require('express');
const router = express.Router();
const invoiceController = require('./invoiceController')
const jwtVerify = require('../../middleware/jwtMiddleware')

router
.route('/')
.get( jwtVerify(['admin']),invoiceController.getInvoices);


router
.route('/:orderId')
.get(jwtVerify(['user']),invoiceController.getInvoiceByOrderId);

// get invoice


// update
router
.route('/:id')
.patch(jwtVerify(['admin']), invoiceController.updateInvoice)
.delete(jwtVerify(['admin']),invoiceController.deleteInvoice);




module.exports = router;