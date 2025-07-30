const express = require('express');
const router = express.Router();
const sizeChartController = require('./sizeChartController');

router
.route('/')
.get(sizeChartController.getAllSizeCharts)
.post(sizeChartController.createSizeChart);



router
.route('/:id')
.get( sizeChartController.getSizeChartById)
.patch(sizeChartController.updateSizeChart)
.delete(sizeChartController.deleteSizeChart);

module.exports = router;