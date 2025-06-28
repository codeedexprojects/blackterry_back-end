const express = require('express');
const router = express.Router();
const textSliderController = require('./textSliderController');
const jwtVerify = require('../../middleware/jwtMiddleware');

// Create new carousel
router
.route('/')
.get(textSliderController.getTextSliders)
.post(
//   jwtVerify(['admin']),
  textSliderController.createTextSlider
);


// Update carousel
router
.route('/:id')
.patch(
//   jwtVerify(['admin']),
  textSliderController.updateTextSlider
)
.delete(
    //  jwtVerify(['admin']),
      textSliderController.deleteTextSlider);


module.exports = router;
