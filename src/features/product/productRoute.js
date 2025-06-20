const express = require('express');
const router = express.Router();
const productController = require('./productController')
const jwtVerify = require('../../middleware/jwtMiddleware')
const multerMiddleware =require('../../middleware/multerMiddleware')


// Add a new product
router.post('/create-product',
    // jwtVerify(['admin']),
    multerMiddleware.upload.array("images",5), productController.addProduct );

// Get all products
router.get('/',
    // jwtVerify(['admin']),
 productController.getAllProducts);

// Get a single product by ID
router.get('/:id', productController.getProductById);

// // Update a product with image handling
router.patch('/:id',
    //  jwtVerify(['admin']),
     multerMiddleware.upload.array("images",5), productController.updateProduct);


// // Delete a product
router.delete('/:id',
    // jwtVerify(['admin']), 
    productController.deleteProduct);



module.exports = router;
