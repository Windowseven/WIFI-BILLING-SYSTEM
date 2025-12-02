const express = require('express');
const router = express.Router();
const OfferController = require('../controllers/offerController');

// When device connects → request is sent here
router.post('/offer/check', OfferController.handleOffer);

module.exports = router;
