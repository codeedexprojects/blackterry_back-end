const express = require('express');
const router = express.Router();
const multerMiddleware = require('../../middleware/multerMiddleware');
const carouselController = require('./carouselController');
const jwtVerify = require('../../middleware/jwtMiddleware');

// Create new carousel
router.post(
  '/create',
  jwtVerify(['admin']),
  multerMiddleware.upload.single('image'),
  carouselController.createCarousel
);

// Get all carousels
router.get('/', carouselController.getAllCarousels);

// Update carousel
router.patch(
  '/:id',
  jwtVerify(['admin']),
  multerMiddleware.upload.single('image'),
  carouselController.updateCarousel
);

// Delete carousel
router.delete('/:id',
     jwtVerify(['admin']),
      carouselController.deleteCarousel);


module.exports = router;
