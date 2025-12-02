const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const sessionController = require('../controllers/sessionController');

// Hotspot/start: this endpoint **may** be public for portal to call (or protected with a secret)
router.post('/start',
  body('voucher_code').isString().trim(),
  body('mac').isString().trim(),
  body('ip').isString().trim(),
  sessionController.startSession
);

// Hotspot reports usage (ideally protected via shared secret or from localhost)
router.post('/update',
  body('session_id').isInt(),
  body('data_used_mb').isInt(),
  sessionController.updateSession
);

// Stop session (hotspot or admin)
router.post('/stop',
  body('session_id').isInt(),
  sessionController.stopSession
);

module.exports = router;
