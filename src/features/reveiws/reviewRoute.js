const express = require('express');
const router = express.Router();
const ReviewController = require('./reviewController')
const multerMiddleware =require('../../middleware/multerMiddleware')
const jwtVerify=require('../../middleware/jwtMiddleware')



router
.route('/')
.post(jwtVerify(['user']),multerMiddleware.upload.single('image'), ReviewController.addReview);
router
.route('/:productId')
.get(ReviewController.getReviewsByProduct); 

module.exports = router;