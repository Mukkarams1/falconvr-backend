const express = require('express');
const { ENVIRONMENTS } = require('../config/environments');

const router = express.Router();

// GET /api/v1/environments — returns the list of available VR environments
router.get('/', (_req, res) => {
  res.json({ success: true, environments: ENVIRONMENTS });
});

module.exports = router;
