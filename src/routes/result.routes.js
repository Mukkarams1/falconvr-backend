// ============================================================
//  result.routes.js — Quiz Result Routes
//  Mounted at: /api/v1/results
// ============================================================
//
//  POST /            — public (VR app submits without teacher login)
//  GET  /            — protected (dashboard reads results)
//  GET  /subject/:id — protected (filter results by subject)
//  GET  /:id         — protected (single result detail)
// ============================================================

const express = require('express');
const {
  submitResult, getResults, getResultsBySubject, getResult,
} = require('../controllers/result.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// VR app posts result — no auth needed (student has no account)
router.post('/', submitResult);

// Dashboard reads results — must be logged in
router.get('/',                   protect, getResults);
router.get('/subject/:subjectId', protect, getResultsBySubject);
router.get('/:id',                protect, getResult);

module.exports = router;
