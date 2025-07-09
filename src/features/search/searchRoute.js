const express = require('express');
const router = express.Router();
const searchController = require('../search/searchController')


router.get('/',searchController.MainSearch)

module.exports = router;    